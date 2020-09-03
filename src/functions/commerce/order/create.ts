import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../helper"
import { OrderError, Response, captureMethodForSalesMethod, checkOrder } from "./helper"
import Stripe from "stripe"
import Cart from "../../models/commerce/Cart"
import Provider from "../../models/commerce/Provider"
import User from "../../models/commerce/User"
import Customer from "../../models/commerce/Customer"
import Order, { OrderItem } from "../../models/commerce/Order"
import { randomShard } from "../../common/Shard"

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.info(data)
	const uid: string = context.auth.uid

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
	const customerID = await Customer.getCustomerID(uid)
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

	const isOnSession = order.salesMethod === "instore" || order.salesMethod === "download"
	const setup_future_usage = isOnSession ? "on_session" : "off_session"
	const capture_method = captureMethodForSalesMethod(order.salesMethod)
	const confirm = true
	const shipping = order.shipping
	if (order.salesMethod === "online") {
		if (!shipping) {
			return { error: { message: `Online sales require an address.`, target: order.path } } as Response
		}
	}

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
				switch (order.salesMethod) {
					case "instore": {
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
					case "online": {
						order.paymentStatus = "processing"
						order.deliveryStatus = "preparing_for_delivery"
						break
					}
				}
				transaction.set(userOrderRef, {
					...order.data(),
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
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
