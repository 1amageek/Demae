import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { getProviderID } from "../helper"
import { OrderError, Response } from "./helper"
import Stripe from "stripe"
import Provider from "../../models/commerce/Provider"
import Order from "../../models/commerce/Order"
import { Account } from "../../models/account"


// Not using this function.
// https://stripe.com/docs/strong-customer-authentication
export const confirm = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}

	functions.logger.info(data)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const orderID: string = data.orderID
	if (!orderID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an orderID.")
	}
	const paymentIntentID = data.paymentIntentID
	if (!paymentIntentID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not contain a paymentIntentID.")
	}
	const providerID = await getProviderID(uid)
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a providerID.")
	}
	const providerOrderRef = new Provider(providerID).orders.collectionReference.doc(orderID)
	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			const snapshot = await transaction.get(providerOrderRef)
			if (!snapshot.exists) {
				throw new functions.https.HttpsError("invalid-argument", `The order does not exist. ${providerOrderRef.path}`)
			}
			const order = Order.fromSnapshot<Order>(snapshot)
			if (order.paymentStatus !== "processing") {
				throw new functions.https.HttpsError("invalid-argument", `Invalid order status.. ${providerOrderRef.path}`)
			}
			const tasks = order.items.map(async item => {
				if (item.mediatedBy) {
					const transferAmount = Math.floor(item.amount * 0.2)
					const account = await Account.get<Account>(item.mediatedBy)
					const accountID = account?.accountID
					if (account && accountID) {
						return {
							amount: transferAmount,
							currency: item.currency,
							destination: accountID,
							transfer_group: orderID,
							description: `Transfer from Order: [${orderID}] to UID: [${account.id}]`,
							metadata: {
								uid: account.id
							}
						} as Stripe.TransferCreateParams
					}
				}
				return undefined
			})

			try {
				// Check the stock status.
				const result = await stripe.paymentIntents.confirm(paymentIntentID, {
					idempotencyKey: orderID
				})
				const updateData: Partial<Order> = {
					paymentStatus: "succeeded",
					paymentResult: result,
					updatedAt: admin.firestore.FieldValue.serverTimestamp() as any
				}
				const mediatorTransferDataSet = (await Promise.all(tasks)).filter(value => value !== undefined) as Stripe.TransferCreateParams[]
				const transferTasks = mediatorTransferDataSet.map(async data => {
					return await stripe.transfers.create(data, { idempotencyKey: `${orderID}-${data.destination}` });
				})
				if (transferTasks.length > 0) {
					const result = await Promise.all(transferTasks)
					updateData.transferResults = result
				}
				transaction.set(providerOrderRef, updateData, { merge: true })
				return order.data({ convertDocumentReference: true })
			} catch (error) {
				throw error
			}
		})
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error instanceof OrderError) {
			return { error: { message: error.message, target: error.target } } as Response
		}
		throw error
	}
})
