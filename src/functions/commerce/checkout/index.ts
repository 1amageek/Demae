import * as functions from 'firebase-functions'
import { firestore } from 'firebase-admin'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'
import Order, { OrderItem } from '../../models/commerce/Order'
import SKU, { Stock } from '../../models/commerce/SKU'


type Response = {
	error?: {
		message: string,
		sku: string
	},
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
	const order: Order = Order.fromData(orderData)
	const skuItems: OrderItem[] = order.items.filter(item => item.type === 'sku')
	const skuValidation = skuItems.find(item => { return !(item.skuReference) })
	if (skuValidation) {
		throw new functions.https.HttpsError('invalid-argument', 'OrderItem contains items that do not have SKUReference.')
	}
	const skuReferences = skuItems.map(item => item.skuReference!)
	const SKUSnapshots = await Promise.all(skuReferences.map(ref => ref.get()))
	const SKUs: SKU[] = SKUSnapshots.map(snapshot => SKU.fromSnapshot<SKU>(snapshot))

	// SKU
	const unavailable = SKUs.find(sku => sku.isAvailable === false)
	if (unavailable) {
		return {
			error: {
				success: false,
				sku: unavailable.path,
				message: `Contains unavailable SKU.`
			}
		} as Response
	}

	const bucketSKUs = SKUs.filter(sku => sku.inventory.type === 'bucket')
	const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')
	// const infiniteSKUs = SKUs.filter(sku => sku.inventory.type === 'infinite')

	// Bucket
	const bucketOutOfStock = bucketSKUs.find(sku => sku.inventory.value! === 'out_of_stock')
	if (bucketOutOfStock) {
		return {
			error: {
				success: false,
				sku: bucketOutOfStock.path,
				message: `The SKU is out of stock.`
			}
		} as Response
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
		return {
			error: {
				success: false,
				sku: finiteOutOfStock.path,
				message: `The SKU is out of stock.`
			}
		} as Response
	}

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

	const result = await stripe.paymentIntents.create(request)
	return result

})
