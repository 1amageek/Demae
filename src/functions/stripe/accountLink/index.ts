import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'

type Response = {
	result?: any
	error?: any
}

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	const ACCOUNT_ID = functions.config().stripe.account
	if (!ACCOUNT_ID) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires ACCOUNT_ID.')
	}
	console.info(context)
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	try {
		const result = await stripe.accountLinks.create({
			account: ACCOUNT_ID,
			failure_url: 'https://localhost:3000/failure',
			success_url: 'https://localhost:3000/success',
			type: 'custom_account_verification',
		})
		return { result } as Response
	} catch (error) {
		console.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError('invalid-argument', 'Invalid argument.')
	}
})
