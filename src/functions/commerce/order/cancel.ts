import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { getProviderID, stripe } from "../../helper"
import { Response } from "./helper"
import Stripe from "stripe"
import Provider from "../../models/commerce/Provider"
import User from "../../models/commerce/User"
import Order from "../../models/commerce/Order"
import { DocumentReference } from "@1amageek/ballcap-admin"

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
	const orderID = data.orderID
	if (!orderID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not contain a orderID.")
	}
	const canceledBy = data.canceledBy ?? "provider"
	if (canceledBy === "provider") {
		return _canceledByProvider(uid, orderID)
	} else {
		return _canceledByCustomer(uid, orderID)
	}
})

const _canceledByCustomer = async (uid: string, orderID: string) => {
	const orderRef = new User(uid).orders.collectionReference.doc(orderID)
	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			try {
				const snapshot = await transaction.get(orderRef)
				const order = Order.fromSnapshot<Order>(snapshot)
				if (!order) {
					throw new functions.https.HttpsError("invalid-argument", "This user has not this order.")
				}
				checkCancelOrder(order, "customer")
				const paymentIntentID = order.paymentResult.id
				if (!paymentIntentID) {
					throw new functions.https.HttpsError("internal", "Your order does not contain the required information.")
				}
				// Check order cancellable.
				const request = await cancelRequestForOrder(uid, order)
				const result = await stripe.paymentIntents.cancel(paymentIntentID, request, {
					idempotencyKey: `${orderRef.path}-cancel`
				})
				order.paymentCancelResult = result
				const userOrderRef = new User(order.purchasedBy).orders.collectionReference.doc(order.id)
				const providerOrderRef = new Provider(order.providedBy).orders.collectionReference.doc(orderID)
				return _cancel(order, [providerOrderRef, userOrderRef], transaction)
			} catch (error) {
				throw error
			}
		})
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		return { error }
	}
}

const _canceledByProvider = async (uid: string, orderID: string) => {
	const providerID = await getProviderID(uid)
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a providerID.")
	}
	const orderRef = new Provider(providerID).orders.collectionReference.doc(orderID)
	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			try {
				const snapshot = await transaction.get(orderRef)
				const order = Order.fromSnapshot<Order>(snapshot)
				if (!order) {
					throw new functions.https.HttpsError("invalid-argument", "This user has not this order.")
				}
				checkCancelOrder(order, "provider")
				const userOrderRef = new User(order.purchasedBy).orders.collectionReference.doc(order.id)
				const paymentIntentID = order.paymentResult.id
				if (!paymentIntentID) {
					throw new functions.https.HttpsError("internal", "Your order does not contain the required information.")
				}
				// Check order cancellable.
				const request = await cancelRequestForOrder(uid, order)
				const result = await stripe.paymentIntents.cancel(paymentIntentID, request, {
					idempotencyKey: `${orderRef.path}-cancel`
				})
				order.paymentCancelResult = result
				return _cancel(order, [orderRef, userOrderRef], transaction)
			} catch (error) {
				throw error
			}
		})
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		return { error }
	}
}

const _cancel = (order: Order, refs: DocumentReference[], transaction: admin.firestore.Transaction) => {
	order.items = order.items.map(item => {
		item.status = "canceled"
		return item
	})
	order.deliveryStatus = "none"
	order.paymentStatus = "canceled"
	order.isCanceled = true
	refs.forEach(ref => {
		transaction.set(ref, {
			...order.data(),
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		}, { merge: true })
	})
	return {
		id: order.id,
		data: order.data({ convertDocumentReference: true })
	}
}

const checkCancelOrder = (order: Order, canceledBy: "customer" | "provider") => {
	if (order.isCanceled) throw new functions.https.HttpsError("invalid-argument", `This order has already been canceled.`)
	if (canceledBy === "customer") {
		if (order.salesMethod === "instore") throw new functions.https.HttpsError("invalid-argument", `Orders for in-store sales cannot be canceled.`)
		if (order.salesMethod === "pickup") throw new functions.https.HttpsError("invalid-argument", `Take-out orders cannot be canceled.`)
		if (order.salesMethod === "download") throw new functions.https.HttpsError("invalid-argument", `Download orders cannot be canceled.`)
	} else {
		if (order.salesMethod === "instore" && order.deliveryStatus !== "preparing_for_delivery") throw new functions.https.HttpsError("invalid-argument", `The payment has already been made. A refund process is required to cancel the order.`)
		if (order.salesMethod === "pickup" && order.deliveryStatus !== "preparing_for_delivery") throw new functions.https.HttpsError("invalid-argument", `The payment has already been made. A refund process is required to cancel the order.`)
	}
}

const cancelRequestForOrder = async (uid: string, order: Order) => {

	if (uid === order.purchasedBy) {
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
