import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'
import Stripe from 'stripe'
import Account from '../../models/account/Account'

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
	try {
		const result = await stripe.accounts.create({
			...data,
			metadata: {
				uid: uid
			}
		})
		return result
	} catch (error) {
		console.error(error)
		throw error
	}
})

export const update = regionFunctions.https.onCall(async (data, context) => {
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
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.update(accountID, data)
		return result
	} catch (error) {
		console.error(error)
		throw error
	}
})

export const retrieve = regionFunctions.https.onCall(async (_, context) => {
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
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.retrieve(accountID)
		return result
	} catch (error) {
		console.error(error)
		throw error
	}
})

export const uploadFile = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	console.info(context)
	const { bucket, fullPath, name, contentType } = data
	if (!bucket) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an bucket.')
	}
	if (!fullPath) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an fullPath.')
	}
	if (!name) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an name.')
	}
	if (!contentType) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an contentType.')
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	const tempFilePath = path.join(os.tmpdir(), name);
	try {
		await admin.storage().bucket(bucket).file(fullPath).download({ destination: tempFilePath })
		const fp = fs.readFileSync(tempFilePath);
		const file = await stripe.files.create({
			purpose: 'additional_verification',
			file: {
				data: fp,
				name: name,
				type: 'application/octet-stream',
			},
		});
		return file
	} catch {
		throw new functions.https.HttpsError('internal', 'File download failed.')
	}
})
