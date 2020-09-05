import * as admin from "firebase-admin"
import { stripe } from "../../helper"
import Stripe from "stripe"
import Account from "../../models/account/Account"
import Order from "../../models/commerce/Order"
import Config from "../../config"
import { SalesMethod } from "../../models/commerce/Product"

export interface Metadata {
	salesMethod: SalesMethod
	customerUID: string
	customerID: string
	providerUID: string
	orderID: string
	orderPath: string
}

const transferToProvider = async (paymentIntent: Stripe.PaymentIntent, metadata: Metadata) => {
	if (paymentIntent.amount <= 0) return
	const accountID = await Account.getAccountID(metadata.providerUID)
	if (!accountID) {
		throw Error("The AccountID required for transfer is missing.")
	}
	const fee = Math.floor(paymentIntent.amount * Config.fee.charge[metadata.salesMethod] / 100)
	const amount = paymentIntent.amount - fee
	const request = {
		amount: amount,
		currency: paymentIntent.currency,
		destination: accountID,
		transfer_group: metadata.orderID,
		description: `Transfer from Order: [${metadata.orderID}] to Provider UID: [${metadata.orderID}]`,
		source_transaction: paymentIntent.id,
		metadata: {
			...metadata,
			transferTo: metadata.providerUID,
		}
	} as Stripe.TransferCreateParams
	return await stripe.transfers.create(request, { idempotencyKey: `${metadata.orderPath}-transferToProvider` });
}

export const transferToCollaborators = async (paymentIntent: Stripe.PaymentIntent, metadata: Metadata) => {
	const ref = admin.firestore().doc(metadata.orderPath)
	const order = await Order.get<Order>(ref)
	if (!order) throw Error("Invalid Order Ref")

	const tasks = order.items.map(async item => {
		if (item.mediatedBy) {
			const fee = Math.floor(paymentIntent.amount * Config.fee.charge[metadata.salesMethod] / 100)
			const amount = paymentIntent.amount - fee
			const account = await Account.get<Account>(item.mediatedBy)
			const accountID = account?.stripe?.id
			if (account && accountID) {
				return {
					amount: amount,
					currency: item.currency,
					destination: accountID,
					transfer_group: order.id,
					description: `Transfer from Order: [${order.id}] to UID: [${account.id}]`,
					source_transaction: paymentIntent.charges.data[0].id,
					metadata: {
						...metadata,
						transferTo: item.mediatedBy,
					}
				} as Stripe.TransferCreateParams
			}
		}
		return undefined
	})
	const transferRequests = (await Promise.all(tasks)).filter(value => value !== undefined) as Stripe.TransferCreateParams[]
	const transferTasks = transferRequests.map(async data => {
		return stripe.transfers.create(data, { idempotencyKey: `${metadata.orderPath}-transferTo-${data.metadata!.transferTo}` });
	})
	if (transferTasks.length > 0) {
		return await Promise.all(transferTasks)
	}
	return []
}

export const transfer = async (paymentIntent: Stripe.PaymentIntent, metadata: Metadata) => {

	const ref = admin.firestore().doc(metadata.orderPath)

	const result = await admin.firestore().runTransaction(async transaction => {
		const results = []
		const result = await transferToProvider(paymentIntent, metadata)
		// const results = await transferToCollaborators(paymentIntent, metadata)
		if (result) {
			results.push(result)
		}
		transaction.set(ref, { transferResults: results }, { merge: true })
		return results
	})

	return result



	// const ref = admin.firestore().doc(metadata.order.path)
	// const order = await Order.get<Order>(ref)
	// if (!order) throw new Error("Invalid metadata")

	// const tasks = order.items.map(async item => {
	// 	if (item.mediatedBy) {
	// 		const transferAmount = Math.floor(item.amount * 0.2)
	// 		const account = await Account.get<Account>(item.mediatedBy)
	// 		const accountID = account?.stripe?.id
	// 		if (account && accountID) {
	// 			return {
	// 				amount: transferAmount,
	// 				currency: item.currency,
	// 				destination: accountID,
	// 				transfer_group: orderID,
	// 				description: `Transfer from Order: [${orderID}] to UID: [${account.id}]`,
	// 				source_transaction: paymentIntent.charges.data[0].id,
	// 				metadata: {
	// 					mediatedBy: item.mediatedBy,
	// 					uid: account.id,
	// 					key: `${orderID}-${item.skuReference!.id}-${account.id}`
	// 				}
	// 			} as Stripe.TransferCreateParams
	// 		}
	// 	}
	// 	return undefined
	// })
	// const mediatorTransferTasks = (await Promise.all(tasks)).filter(value => value !== undefined) as Stripe.TransferCreateParams[]
	// const mediatorTransferDataSet = mediatorTransferTasks.concat(providerTransferTasks)
	// const transferTasks = mediatorTransferDataSet.map(async data => {
	// 	return stripe.transfers.create(data, { idempotencyKey: `${data.metadata!.key}` });
	// })
	// if (transferTasks.length > 0) {
	// 	const result = await Promise.all(transferTasks)
	// 	updateData.transferResults = result
	// }
}
