import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { Response } from "./helper"
import Stripe from "stripe"
import User from "../../models/commerce/User"
import Provider from "../../models/commerce/Provider"
import Order from "../../models/commerce/Order"

export const cancel = regionFunctions.https.onCall(async (data, context) => {
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

	const orderID = data.orderID
	if (!orderID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not contain a paymentMethodID.")
	}
	const orderRef = new User(uid).orders.collectionReference.doc(orderID)
	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			try {
				const snapshot = await transaction.get(orderRef)
				const order = Order.fromSnapshot<Order>(snapshot, { convertDocument: true })
				if (!order) {
					throw new functions.https.HttpsError("invalid-argument", "This user has not this order.")
				}
				const paymentIntentID = order.paymentResult.id
				if (!paymentIntentID) {
					throw new functions.https.HttpsError("internal", "Your order does not contain the required information.")
				}
				// Check order cancellable.
				const request = await cancelRequestForOrder(uid, order)
				const result = await stripe.paymentIntents.cancel(paymentIntentID, request, {
					idempotencyKey: `${orderRef.path}-cancel`
				})
				const provider: Provider = new Provider(order.providedBy)
				const recieveOrderRef = provider.orders.collectionReference.doc(order.id)
				order.items = order.items.map(item => {
					item.status = "cancelled"
					return item
				})
				order.paymentCancelResult = result
				order.isCancelled = true
				transaction.set(recieveOrderRef, {
					...order.data(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
				transaction.set(orderRef, {
					...order.data(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
				return order.data({ convertDocumentReference: true })
			} catch (error) {
				throw error
			}
		})
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		return { error }
	}
})

const cancelRequestForOrder = async (uid: string, order: Order) => {

	if (uid === order.purchasedBy) {
		if (order.isCancelled) throw new functions.https.HttpsError("invalid-argument", `This order has already been cancelled.`)
		if (order.deliveryMethod === "pickup") throw new functions.https.HttpsError("invalid-argument", `Take-out orders cannot be cancelled.`)
		if (order.deliveryMethod === "none") throw new functions.https.HttpsError("invalid-argument", `Orders for in-store sales cannot be cancelled.`)
		if (order.deliveryStatus === "delivered") throw new functions.https.HttpsError("invalid-argument", `Orders that have already been delivered cannot be cancelled.`)

		const request = {
			cancellation_reason: "requested_by_customer",
			expand: []
		} as Stripe.PaymentIntentCancelParams
		return request
	}

	const userRecord = await admin.auth().getUser(uid)
	if (!userRecord.customClaims) throw new functions.https.HttpsError("permission-denied", `The user does not have the right to change the order.`)
	const adminUser = userRecord.customClaims.admin
	if (!adminUser) throw new functions.https.HttpsError("permission-denied", `The user does not have the right to change the order.`)
	if (order.providedBy !== adminUser) throw new functions.https.HttpsError("permission-denied", `The user does not have the right to change the order.`)
	const request = {
		cancellation_reason: "abandoned",
		expand: []
	} as Stripe.PaymentIntentCancelParams
	return request
}
