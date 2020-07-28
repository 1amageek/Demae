import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { getProviderID } from "../helper"
import { OrderError, Response, captureMethodForDeliveryMethod, checkOrder } from "./helper"
import Stripe from "stripe"
import Cart from "../../models/commerce/Cart"
import Provider from "../../models/commerce/Provider"
import User from "../../models/commerce/User"
import Order, { OrderItem } from "../../models/commerce/Order"
import { randomShard } from "../../common/Shard"

export const create = regionFunctions.https.onCall(async (data, context) => {
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

	const groupID = data.groupID
	if (!groupID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an groupID.")
	}
	const orderData = data.order
	if (!orderData) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an Order.")
	}
	const paymentMethodID = data.paymentMethodID
	if (!paymentMethodID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not contain a paymentMethodID.")
	}
	const customerID = data.customerID
	if (!customerID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not contain a customerID.")
	}
	const cart = await Cart.get<Cart>(uid)
	if (!cart) {
		throw new functions.https.HttpsError("invalid-argument", "This user has not cart.")
	}
	const userOrderRef = new User(uid).orders.collectionReference.doc()
	const order: Order = Order.fromData(orderData, userOrderRef, { convertDocumentReference: true })
	const cartItemGroups = cart.groups.filter(group => group.groupID !== groupID)

	const isOnSession = order.deliveryMethod === "none" || order.deliveryMethod === "download"
	const setup_future_usage = isOnSession ? "on_session" : "off_session"
	const capture_method = captureMethodForDeliveryMethod(order.deliveryMethod)
	const confirm = true

	const request = {
		setup_future_usage,
		capture_method,
		confirm,
		amount: order.amount,
		currency: order.currency,
		customer: customerID,
		shipping: order.shipping?.data(),
		payment_method: paymentMethodID,
		transfer_group: order.id,
		metadata: {
			uid: uid,
		}
	} as Stripe.PaymentIntentCreateParams

	try {

		const result = await admin.firestore().runTransaction(async transaction => {
			try {
				// Check the stock status.

				const SKUs = await checkOrder(order)
				const skuItems: OrderItem[] = order.items
				const finiteSKUs = SKUs.filter(sku => sku.inventory.type === "finite")

				// Transaction write
				if (finiteSKUs.length) {
					const stocks = await Promise.all(finiteSKUs.map(sku => {
						const id = randomShard(sku.shardCharacters)
						return transaction.get(sku.stocks.collectionReference.doc(id))
					}))

					finiteSKUs.forEach((sku, index) => {
						const snapshot = stocks[index]
						const orderItem = skuItems.find(item => item.skuReference!.path === sku.path)
						const data = snapshot.data() || { count: 0 }
						const count = data.count - orderItem!.quantity
						transaction.set(snapshot.ref, { count })
					})
				}

				const result = await stripe.paymentIntents.create(request, {
					idempotencyKey: userOrderRef.path
				})

				const provider: Provider = new Provider(order.providedBy)
				const providerOrderRef = provider.orders.collectionReference.doc(order.id)
				order.paymentResult = result
				switch (order.deliveryMethod) {
					case "none": {
						order.paymentStatus = "succeeded"
						order.deliveryStatus = "none"
						break
					}
					case "download": {
						order.paymentStatus = "succeeded"
						order.deliveryStatus = "none"
						order.paidAt = admin.firestore.FieldValue.serverTimestamp()
						break
					}
					case "pickup": {
						order.paymentStatus = "processing"
						order.deliveryStatus = "preparing_for_delivery"
						break
					}
					case "shipping": {
						order.paymentStatus = "processing"
						order.deliveryStatus = "preparing_for_delivery"
						break
					}
				}
				transaction.set(providerOrderRef, {
					...order.data(),
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
				transaction.set(cart.documentReference, {
					groups: cartItemGroups
				}, { merge: true })
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
