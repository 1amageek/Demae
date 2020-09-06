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

const transferToProvider = async (paymentIntent: Stripe.PaymentIntent) => {
	if (paymentIntent.amount <= 0) return
	const metadata = paymentIntent.metadata as unknown as Metadata
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
		description: `Transfer from Order: [${metadata.orderID}] to Provider UID: [${metadata.providerUID}]`,
		source_transaction: paymentIntent.charges.data[0].id,
		metadata: {
			...metadata,
			transferTo: metadata.providerUID,
		}
	} as Stripe.TransferCreateParams
	return await stripe.transfers.create(request, { idempotencyKey: `${metadata.orderPath}-transferToProvider` });
}

export const transferToCollaborators = async (paymentIntent: Stripe.PaymentIntent, order: Order) => {
	const metadata = paymentIntent.metadata as unknown as Metadata
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

export const create = async (paymentIntent: Stripe.PaymentIntent) => {
	const metadata = paymentIntent.metadata
	const { orderPath } = metadata
	if (orderPath) {
		const result = await admin.firestore().runTransaction(async transaction => {
			const ref = admin.firestore().doc(orderPath)
			const snapshot = await transaction.get(ref)
			const order = Order.fromSnapshot<Order>(snapshot)
			if (!order) throw Error("Invalid Order Ref")
			if (order.refundStatus !== "none") throw Error("The Order has been refunded.")

			const results = []
			const result = await transferToProvider(paymentIntent)
			// const results = await transferToCollaborators(paymentIntent, metadata)
			if (result) {
				results.push(result)
			}
			transaction.set(ref, { transferStatus: "succeeded", transferResults: results }, { merge: true })
			return results
		})
		return result
	}
	return []
}

export const createReversal = async (chrage: Stripe.Charge) => {
	const metadata = chrage.metadata
	const { orderPath } = metadata
	if (orderPath) {
		const ref = admin.firestore().doc(orderPath)
		const result = await admin.firestore().runTransaction(async transaction => {
			const snapshot = await transaction.get(ref)
			const order: Order = Order.fromSnapshot<Order>(snapshot)
			const transferResults: Stripe.Transfer[] = order.transferResults ?? []
			const tasks = transferResults.map(transfer => {
				return stripe.transfers.createReversal(transfer.id, {
					amount: transfer.amount,
					description: "Refunded",
					metadata: metadata
				}, {
					idempotencyKey: `${orderPath}-createReversal-${transfer.id}`
				})
			})
			const results = await Promise.all(tasks)
			transaction.set(ref, { transferStatus: "refunded", transferReversalResults: results }, { merge: true })
			return results
		})
		return result
	}
	return []
}

