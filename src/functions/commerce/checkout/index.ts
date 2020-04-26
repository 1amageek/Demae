import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'
import User from '../../models/commerce/User'
import Provider from '../../models/commerce/Provider'
import Order, { OrderItem } from '../../models/commerce/Order'
import SKU, { Stock } from '../../models/commerce/SKU'
import { randomShard } from '../../common/Shard'

class OrderError extends Error {
	target: string
	constructor(message: string, target: string) {
		super(message)
		this.target = target
	}
}

type Response = {
	error?: { message: string, target: string }
	result?: any
}

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	console.info(context)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })

	const orderData = data.order
	if (!orderData) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an Order.')
	}
	const paymentMethodID = data.paymentMethodID
	if (!paymentMethodID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentMethodID.')
	}
	const customerID = data.customerID
	if (!customerID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a customerID.')
	}
	const order: Order = Order.from(orderData, { convertDocumentReference: true })

	try {
		// Check the stock status.
		await checkOrder(order)

		const request = {
			setup_future_usage: 'off_session',
			amount: order.amount,
			currency: order.currency,
			customer: customerID,
			shipping: order.shipping?.data(),
			payment_method: paymentMethodID,
			metadata: {
				uid: uid,
			}
		} as Stripe.PaymentIntentCreateParams

		const orderRef = new User(uid).orders.collectionReference.doc()
		const result = await admin.firestore().runTransaction(async transaction => {
			const result = await stripe.paymentIntents.create(request, {
				idempotencyKey: orderRef.path
			})
			transaction.set(orderRef, {
				...order.data(),
				createdAt: admin.firestore.FieldValue.serverTimestamp(),
				updatedAt: admin.firestore.FieldValue.serverTimestamp()
			})
			return {
				paymentIntentID: result.id,
				orderID: orderRef.id
			}
		})
		return { result } as Response
	} catch (error) {
		console.error(error)
		if (error instanceof OrderError) {
			return { error: { message: error.message, target: error.target } } as Response
		}
		throw error
	}
})

export const confirm = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	console.info(context)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })

	const orderID = data.orderID
	if (!orderID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an orderID.')
	}
	const paymentIntentID = data.paymentIntentID
	if (!paymentIntentID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentIntentID.')
	}

	const orderRef = new User(uid).orders.collectionReference.doc(orderID)

	try {
		const result = await admin.firestore().runTransaction(async transaction => {
			const snapshot = await transaction.get(orderRef)
			if (!snapshot.exists) {
				throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
			}
			const order = Order.fromSnapshot<Order>(snapshot)

			if (order.paymentStatus !== 'none') {
				throw new functions.https.HttpsError('invalid-argument', `Invalid order status.. ${orderRef.path}`)
			}

			try {
				// Check the stock status.
				const SKUs = await checkOrder(order)
				const skuItems: OrderItem[] = order.items
				const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')
				const result = await stripe.paymentIntents.confirm(paymentIntentID, {
					idempotencyKey: orderID
				})

				// Transaction write
				const stocks = await Promise.all(finiteSKUs.map(sku => {
					const id = randomShard(sku.shardCharacters)
					return transaction.get(sku.inventories.collectionReference.doc(id))
				}))
				finiteSKUs.forEach((sku, index) => {
					const snapshot = stocks[index]
					const orderItem = skuItems.find(item => item.skuReference!.path === sku.path)
					const data = snapshot.data() || { count: 0 }
					const count = data.count - orderItem!.quantity
					transaction.set(snapshot.ref, { count })
				})
				const recieveOrderRef = new Provider(order.providerID).orders.collectionReference.doc(orderID)
				order.paymentStatus = 'paid'
				order.paymentResult = result
				transaction.set(recieveOrderRef, {
					...order.data(),
					createdAt: order.createdAt,
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
				transaction.set(orderRef, {
					...order.data(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				}, { merge: true })
				return order.data({ convertDocumentReference: true })
			} catch (error) {
				throw error
			}
		})
		return { result } as Response
	} catch (error) {
		console.error(error)
		if (error instanceof OrderError) {
			return { error: { message: error.message, target: error.target } } as Response
		}
		throw error
	}
})

const checkOrder = async (order: Order) => {

	const skuItems: OrderItem[] = order.items
	const skuValidation = skuItems.find(item => { return !(item.skuReference) })
	if (skuValidation) {
		throw new OrderError(`OrderItem contains items that do not have SKUReference.`, '')
	}
	const skuReferences = skuItems.map(item => item.skuReference!)
	const SKUSnapshots = await Promise.all(skuReferences.map(ref => ref.get()))
	const SKUs: SKU[] = SKUSnapshots.map(snapshot => SKU.fromSnapshot<SKU>(snapshot))

	// SKU
	const unavailable = SKUs.find(sku => sku.isAvailable === false)
	if (unavailable) {
		console.log(`Contains unavailable SKU. ${unavailable.path}`)
		throw new OrderError(`Contains unavailable SKU.`, unavailable.path)
	}

	const bucketSKUs = SKUs.filter(sku => sku.inventory.type === 'bucket')
	const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')

	// Bucket
	const bucketOutOfStock = bucketSKUs.find(sku => sku.inventory.value! === 'out_of_stock')
	if (bucketOutOfStock) {
		console.log(`Bucket SKU is out of stock. ${bucketOutOfStock.path}`)
		throw new OrderError(`Bucket SKU is out of stock.`, bucketOutOfStock.path)
	}

	// Finite
	const finiteSKUInventories = await Promise.all(finiteSKUs.map(sku => sku.inventories.collectionReference.get()))
	const finiteOutOfStock = finiteSKUs.find((sku, index) => {
		const snapshot = finiteSKUInventories[index]
		const stockCount = snapshot.docs
			.map(doc => Stock.fromSnapshot<Stock>(doc))
			.reduce((prev, current) => prev + current.count, 0)
		const orderItem = skuItems.find(item => item.skuReference!.path === sku.path)
		return orderItem!.quantity > stockCount
	})
	if (finiteOutOfStock) {
		console.log(`Finite SKU is out of stock. ${finiteOutOfStock.path}`)
		throw new OrderError(`Finite SKU is out of stock.`, finiteOutOfStock.path)
	}

	return SKUs
}
