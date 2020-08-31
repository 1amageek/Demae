import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../../helper"
import Stripe from "stripe"
import { ErrorCode } from "../../helper"
import { nullFilter } from "../../../helper"
import Product from "../../../models/commerce/Product"

import * as Plan from "./Plan"
import * as SKU from "./SKU"

export const plan = { ...Plan }
export const sku = { ...SKU }

const triggerdPath = "/commerce/{version}/providers/{uid}/products/{productID}"

export const onCreate = regionFunctions.firestore
	.document(triggerdPath)
	.onCreate(async (snapshot, context) => {
		console.info(context)
		const product: Product = Product.fromSnapshot(snapshot)
		let data: Stripe.ProductCreateParams = {
			id: product.id,
			type: product.type,
			name: product.name,
			caption: product.caption,
			description: product.description,
			active: product.isAvailable,
			shippable: product.salesMethod === "online",
			metadata: {
				product_path: product.path
			}
		}
		if (product.type === "service") {
			data.unit_label = product.unitLabel
		}
		try {
			await stripe.products.create(nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			functions.logger.error(error)
			product.isAvailable = false
			await product.update()
		}
	})

export const onUpdate = regionFunctions.firestore
	.document(triggerdPath)
	.onUpdate(async (snapshot, context) => {
		console.info(context)
		const product: Product = Product.fromSnapshot(snapshot.after)
		if (!product.isAvailable) {
			return
		}
		let data: Stripe.ProductUpdateParams = {
			name: product.name,
			caption: product.caption,
			description: product.description,
			active: product.isAvailable,
			shippable: product.salesMethod === "online",
			metadata: {
				product_path: product.path
			}
		}
		if (product.type === "service") {
			data.unit_label = product.unitLabel
		}
		try {
			await stripe.products.update(product.id, nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			functions.logger.error(error)
			product.isAvailable = false
			await product.update()
		}
	})


