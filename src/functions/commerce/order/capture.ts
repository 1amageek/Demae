import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { OrderError, Response } from "./helper"
import Stripe from "stripe"
import User from "../../models/commerce/User"
import Provider from "../../models/commerce/Provider"
import Order from "../../models/commerce/Order"
import { Account } from "../../models/account"
import { request } from "express"

export const capture = regionFunctions.https.onCall(async (data, context) => {
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

	const orderRef = new User(uid).orders.collectionReference.doc(orderID)
	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			const snapshot = await transaction.get(orderRef)
			if (!snapshot.exists) {
				throw new functions.https.HttpsError("invalid-argument", `The order does not exist. ${orderRef.path}`)
			}
			const order = Order.fromSnapshot<Order>(snapshot)
			if (order.paymentStatus === "succeeded") {
				const updateData: Partial<Order> = {
					deliveryStatus: "in_transit",
					updatedAt: admin.firestore.FieldValue.serverTimestamp() as any
				}
				const recieveOrderRef = new Provider(order.providedBy).orders.collectionReference.doc(orderID)
				transaction.set(orderRef, updateData, { merge: true })
				transaction.set(recieveOrderRef, updateData, { merge: true })
				return order.data({ convertDocumentReference: true })
			}
			if (order.paymentStatus !== "processing") {
				throw new functions.https.HttpsError("invalid-argument", `Invalid order status.. ${orderRef.path}`)
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
								mediatedBy: item.mediatedBy,
								uid: account.id
							}
						} as Stripe.TransferCreateParams
					}
				}
				return undefined
			})

			try {
				// Check the stock status.
				const result = await stripe.paymentIntents.capture(paymentIntentID, {
					idempotencyKey: orderID
				})
				let updateData: Partial<Order> = {
					paymentStatus: "succeeded",
					deliveryStatus: "in_transit",
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

				const recieveOrderRef = new Provider(order.providedBy).orders.collectionReference.doc(orderID)
				transaction.set(orderRef, updateData, { merge: true })
				transaction.set(recieveOrderRef, updateData, { merge: true })
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
