import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'
import Account from '../../models/commerce/Account'

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	try {
		const result = await stripe.accounts.create({
			...data,
			description: uid
		})
		return result
	} catch (error) {
		console.error(error)
	}
	return
})

export const update = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.update(accountID, data)
		return result
	} catch (error) {
		console.error(error)
	}
	return
})

export const retrieve = regionFunctions.https.onCall(async (_, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.retrieve(accountID)
		return result
	} catch (error) {
		console.error(error)
	}
	return
})

