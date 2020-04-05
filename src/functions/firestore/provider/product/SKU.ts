import * as functions from 'firebase-functions'
import { regionFunctions } from '../../../helper'
import Stripe from 'stripe'
import { ErrorCode } from '../../helper'
import { nullFilter } from '../../../helper'
import SKU from '../../../models/commerce/SKU'

const triggerdPath = '/commerce/{version}/providers/{uid}/products/{productID}/SKUs/{skuID}'

export const onCreate = regionFunctions.firestore
	.document(triggerdPath)
	.onCreate(async (snapshot, context) => {
		console.info(context)
		const STRIPE_API_KEY = functions.config().stripe.api_key
		if (!STRIPE_API_KEY) {
			throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
		}
		const sku: SKU = SKU.fromSnapshot(snapshot)
		const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
		const data: Stripe.SkuCreateParams = {
			id: sku.id,
			product: sku.parent.parent!.id,
			inventory: sku.inventory,
			currency: sku.currency,
			price: sku.amount,
			active: sku.isAvailable,
			metadata: {
				sku_path: sku.path,
				product_path: sku.parent.parent!.path
			}
		}
		try {
			await stripe.skus.create(nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			console.error(error)
			sku.isAvailable = false
			await sku.update()
		}
	})

export const onUpdate = regionFunctions.firestore
	.document(triggerdPath)
	.onUpdate(async (snapshot, context) => {
		console.info(context)
		const sku: SKU = SKU.fromSnapshot(snapshot.after)
		if (!sku.isAvailable) {
			return
		}
		const STRIPE_API_KEY = functions.config().stripe.api_key
		if (!STRIPE_API_KEY) {
			throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
		}
		const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
		const data: Stripe.SkuUpdateParams = {
			inventory: sku.inventory,
			currency: sku.currency,
			price: sku.amount,
			active: sku.isAvailable,
			metadata: {
				sku_path: sku.path,
				product_path: sku.parent.parent!.path
			}
		}
		try {
			await stripe.skus.update(sku.id, nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			console.error(error)
			sku.isAvailable = false
			await sku.update()
		}
	})
