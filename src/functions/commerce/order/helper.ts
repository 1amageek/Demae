import * as functions from "firebase-functions"
import Order, { OrderItem } from "../../models/commerce/Order"
import { SalesMethod } from "../../models/commerce/Product"
import SKU, { Stock } from "../../models/commerce/SKU"

export const captureMethodForSalesMethod = (salesMethod: SalesMethod) => {
	switch (salesMethod) {
		case "instore": return "manual"
		case "download": return "automatic"
		case "pickup": return "manual"
		case "online": return "manual"
	}
}

export class OrderError extends Error {
	target: string
	constructor(message: string, target: string) {
		super(message)
		this.target = target
	}
}

export type Response = {
	error?: { message: string, target: string }
	result?: any
}

export const checkOrder = async (order: Order) => {

	const skuItems: OrderItem[] = order.items
	const skuValidation = skuItems.find(item => { return !(item.skuReference) })
	if (skuValidation) {
		functions.logger.log(`OrderItem contains items that do not have SKUReference.`)
		throw new OrderError(`Invalid Request`, skuValidation.productReference?.path || "")
	}
	const skuReferences = skuItems.map(item => item.skuReference!)
	const SKUSnapshots = await Promise.all(skuReferences.map(ref => ref.get()))
	const SKUs: SKU[] = SKUSnapshots.map(snapshot => SKU.fromSnapshot<SKU>(snapshot))

	// SKU
	const unavailable = SKUs.find(sku => sku.isAvailable === false)
	if (unavailable) {
		functions.logger.log(`Contains unavailable SKU. ${unavailable.path}`)
		throw new OrderError(`${unavailable.name} sales have been suspended.`, unavailable.path)
	}

	const bucketSKUs = SKUs.filter(sku => sku.inventory.type === "bucket")
	const finiteSKUs = SKUs.filter(sku => sku.inventory.type === "finite")

	// Bucket
	const bucketOutOfStock = bucketSKUs.find(sku => sku.inventory.value! === "out_of_stock")
	if (bucketOutOfStock) {
		functions.logger.log(`Bucket SKU is out of stock. ${bucketOutOfStock.path}`)
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
		functions.logger.log(`Finite SKU is out of stock. ${finiteOutOfStock.path}`)
		throw new OrderError(`${finiteOutOfStock.name} is sold out.`, finiteOutOfStock.path)
	}

	return SKUs
}
