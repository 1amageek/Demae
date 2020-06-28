import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'
import User from '../../models/commerce/User'
import Cart from '../../models/commerce/Cart'
import Provider from '../../models/commerce/Provider'
import Order, { OrderItem } from '../../models/commerce/Order'
import SKU, { Stock } from '../../models/commerce/SKU'
import { randomShard } from '../../common/Shard'
import { Account } from '../../models/account'

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
	functions.logger.info(data)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })

	const groupID = data.groupID
	if (!groupID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an groupID.')
	}
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

	const cart = await Cart.get<Cart>(uid)
	if (!cart) {
		throw new functions.https.HttpsError('invalid-argument', 'This user has not cart.')
	}

	const orderRef = new User(uid).orders.collectionReference.doc()
	const order: Order = Order.fromData(orderData, orderRef, { convertDocumentReference: true })
	const cartItemGroups = cart.groups.filter(group => group.groupID !== groupID)

	const isOnSession = order.deliveryMethod === 'none'
	const setup_future_usage = isOnSession ? 'on_session' : 'off_session'

	const request = {
		setup_future_usage,
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
				const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')

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
					idempotencyKey: orderRef.path
				})

				const provider: Provider = new Provider(order.providedBy)
				const recieveOrderRef = provider.orders.collectionReference.doc(order.id)
				order.paymentResult = result
				switch (order.deliveryMethod) {
					case 'none': {
						order.paymentStatus = 'succeeded'
						order.deliveryStatus = 'none'
						break
					}
					case 'pickup': {
						order.paymentStatus = 'processing'
						order.deliveryStatus = 'preparing_for_delivery'
						break
					}
					case 'shipping': {
						order.paymentStatus = 'processing'
						order.deliveryStatus = 'preparing_for_delivery'
						break
					}
				}
				transaction.set(recieveOrderRef, {
					...order.data(),
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
					updatedAt: admin.firestore.FieldValue.serverTimestamp()
				})
				transaction.set(orderRef, {
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

	functions.logger.info(data)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	const orderID: string = data.orderID
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
			if (order.paymentStatus !== 'processing') {
				throw new functions.https.HttpsError('invalid-argument', `Invalid order status.. ${orderRef.path}`)
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

			const mediatorTransferDataSet = (await Promise.all(tasks)).filter(value => value !== undefined) as Stripe.TransferCreateParams[]
			const transferTasks = mediatorTransferDataSet.map(async data => {
				return await stripe.transfers.create(data, { idempotencyKey: `${orderID}-${data.destination}` });
			})

			try {
				// Check the stock status.
				const result = await stripe.paymentIntents.confirm(paymentIntentID, {
					idempotencyKey: orderID
				})
				if (transferTasks.length > 0) {
					await Promise.all(transferTasks)
				}
				const updateData: Partial<Order> = {
					paymentStatus: 'succeeded',
					paymentResult: result,
					updatedAt: admin.firestore.FieldValue.serverTimestamp() as any
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
		console.error(error)
		if (error instanceof OrderError) {
			return { error: { message: error.message, target: error.target } } as Response
		}
		throw error
	}
})

export const capture = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}

	functions.logger.info(data)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	const orderID: string = data.orderID
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
			if (order.paymentStatus !== 'processing') {
				throw new functions.https.HttpsError('invalid-argument', `Invalid order status.. ${orderRef.path}`)
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

			const mediatorTransferDataSet = (await Promise.all(tasks)).filter(value => value !== undefined) as Stripe.TransferCreateParams[]
			const transferTasks = mediatorTransferDataSet.map(async data => {
				return await stripe.transfers.create(data, { idempotencyKey: `${orderID}-${data.destination}` });
			})

			try {
				// Check the stock status.
				const result = await stripe.paymentIntents.capture(paymentIntentID, {
					idempotencyKey: orderID
				})
				if (transferTasks.length > 0) {
					await Promise.all(transferTasks)
				}
				const updateData: Partial<Order> = {
					paymentStatus: 'succeeded',
					deliveryStatus: 'in_transit',
					paymentResult: result,
					updatedAt: admin.firestore.FieldValue.serverTimestamp() as any
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
		console.error(error)
		if (error instanceof OrderError) {
			return { error: { message: error.message, target: error.target } } as Response
		}
		throw error
	}
})

// export const confirm = regionFunctions.https.onCall(async (data, context) => {
// 	if (!context.auth) {
// 		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
// 	}
// 	const STRIPE_API_KEY = functions.config().stripe.api_key
// 	if (!STRIPE_API_KEY) {
// 		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
// 	}
// 	console.info(context)
// 	const uid: string = context.auth.uid
// 	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
// 	const orderID = data.orderID

// 	if (!orderID) {
// 		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an orderID.')
// 	}
// 	const paymentIntentID = data.paymentIntentID
// 	if (!paymentIntentID) {
// 		throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentIntentID.')
// 	}

// 	const orderRef = new User(uid).orders.collectionReference.doc(orderID)

// 	try {
// 		const result = await admin.firestore().runTransaction(async transaction => {
// 			const snapshot = await transaction.get(orderRef)
// 			if (!snapshot.exists) {
// 				throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
// 			}
// 			const order = Order.fromSnapshot<Order>(snapshot)

// 			if (order.paymentStatus !== 'none') {
// 				throw new functions.https.HttpsError('invalid-argument', `Invalid order status.. ${orderRef.path}`)
// 			}

// 			try {
// 				// Check the stock status.
// 				const SKUs = await checkOrder(order)
// 				const skuItems: OrderItem[] = order.items
// 				const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')
// 				const result = await stripe.paymentIntents.confirm(paymentIntentID, {
// 					idempotencyKey: orderID
// 				})

// 				// Transaction write
// 				const stocks = await Promise.all(finiteSKUs.map(sku => {
// 					const id = randomShard(sku.shardCharacters)
// 					return transaction.get(sku.stocks.collectionReference.doc(id))
// 				}))
// 				finiteSKUs.forEach((sku, index) => {
// 					const snapshot = stocks[index]
// 					const orderItem = skuItems.find(item => item.skuReference!.path === sku.path)
// 					const data = snapshot.data() || { count: 0 }
// 					const count = data.count - orderItem!.quantity
// 					transaction.set(snapshot.ref, { count })
// 				})
// 				const recieveOrderRef = new Provider(order.providerID).orders.collectionReference.doc(orderID)
// 				order.paymentStatus = 'paid'
// 				order.paymentResult = result
// 				transaction.set(recieveOrderRef, {
// 					...order.data(),
// 					createdAt: order.createdAt,
// 					updatedAt: admin.firestore.FieldValue.serverTimestamp()
// 				})
// 				transaction.set(orderRef, {
// 					...order.data(),
// 					updatedAt: admin.firestore.FieldValue.serverTimestamp()
// 				}, { merge: true })
// 				return order.data({ convertDocumentReference: true })
// 			} catch (error) {
// 				throw error
// 			}
// 		})
// 		return { result } as Response
// 	} catch (error) {
// 		console.error(error)
// 		if (error instanceof OrderError) {
// 			return { error: { message: error.message, target: error.target } } as Response
// 		}
// 		throw error
// 	}
// })

// const transferData = async (order: Order) => {
// 	const items = order.items.filter(item => item.mediatedBy !== null)
// 	items.map(async item => {
// 		const account = await Account.get(item.mediatedBy!)
// 		return {

// 		}
// 	})

// }

const checkOrder = async (order: Order) => {

	const skuItems: OrderItem[] = order.items
	const skuValidation = skuItems.find(item => { return !(item.skuReference) })
	if (skuValidation) {
		console.log(`OrderItem contains items that do not have SKUReference.`)
		throw new OrderError(`Invalid Request`, skuValidation.productReference?.path || '')
	}
	const skuReferences = skuItems.map(item => item.skuReference!)
	const SKUSnapshots = await Promise.all(skuReferences.map(ref => ref.get()))
	const SKUs: SKU[] = SKUSnapshots.map(snapshot => SKU.fromSnapshot<SKU>(snapshot))

	// SKU
	const unavailable = SKUs.find(sku => sku.isAvailable === false)
	if (unavailable) {
		console.log(`Contains unavailable SKU. ${unavailable.path}`)
		throw new OrderError(`${unavailable.name} sales have been suspended.`, unavailable.path)
	}

	const bucketSKUs = SKUs.filter(sku => sku.inventory.type === 'bucket')
	const finiteSKUs = SKUs.filter(sku => sku.inventory.type === 'finite')

	// Bucket
	const bucketOutOfStock = bucketSKUs.find(sku => sku.inventory.value! === 'out_of_stock')
	if (bucketOutOfStock) {
		console.log(`Bucket SKU is out of stock. ${bucketOutOfStock.path}`)
		throw new OrderError(`${bucketOutOfStock.name} is sold out.`, bucketOutOfStock.path)
	}

	// Finite
	const finiteSKUStocks = await Promise.all(finiteSKUs.map(sku => sku.stocks.collectionReference.get()))
	const finiteOutOfStock = finiteSKUs.find((sku, index) => {
		const snapshot = finiteSKUStocks[index]
		const stockCount = snapshot.docs
			.map(doc => Stock.fromSnapshot<Stock>(doc))
			.reduce((prev, current) => prev + current.count, 0)
		const orderItem = skuItems.find(item => item.skuReference!.path === sku.path)
		return orderItem!.quantity > stockCount
	})
	if (finiteOutOfStock) {
		console.log(`Finite SKU is out of stock. ${finiteOutOfStock.path}`)
		throw new OrderError(`${finiteOutOfStock.name} is sold out.`, finiteOutOfStock.path)
	}

	return SKUs
}
