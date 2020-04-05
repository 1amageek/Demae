import * as functions from 'firebase-functions'
import { regionFunctions } from '../../../helper'
import Stripe from 'stripe'
import { ErrorCode } from '../../helper'
import { nullFilter } from '../../../helper'
import Product from '../../../models/commerce/Product'

import * as Plan from './Plan'
import * as SKU from './SKU'

export const plan = { ...Plan }
export const sku = { ...SKU }

const triggerdPath = '/commerce/{version}/providers/{uid}/products/{productID}'

export const onCreate = regionFunctions.firestore
	.document(triggerdPath)
	.onCreate(async (snapshot, context) => {
		console.info(context)
		const STRIPE_API_KEY = functions.config().stripe.api_key
		if (!STRIPE_API_KEY) {
			throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
		}
		const product: Product = Product.fromSnapshot(snapshot)
		const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
		const data: Stripe.ProductCreateParams = {
			id: product.id,
			type: product.type,
			name: product.name,
			caption: product.caption,
			description: product.description,
			active: product.isAvailable,
			metadata: {
				product_path: product.path
			}
		}
		try {
			await stripe.products.create(nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			console.error(error)
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
		const STRIPE_API_KEY = functions.config().stripe.api_key
		if (!STRIPE_API_KEY) {
			throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
		}
		const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
		const data: Stripe.ProductUpdateParams = {
			name: product.name,
			caption: product.caption,
			description: product.description,
			active: product.isAvailable,
			metadata: {
				product_path: product.path
			}
		}
		try {
			await stripe.products.update(product.id, nullFilter(data))
		} catch (error) {
			if (error.raw) {
				if (error.raw.code === ErrorCode.resource_missing) {
					return
				}
			}
			console.error(error)
			product.isAvailable = false
			await product.update()
		}
	})


