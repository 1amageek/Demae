import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { regionFunctions } from '../../helper'

export const attach = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
	}
	console.info(context)
	const uid: string = context.auth.uid
	const providerID = data.providerID
	if (!providerID) {
		throw new functions.https.HttpsError('invalid-argument', 'This request does not include an providerID.')
	}
	await admin.auth().setCustomUserClaims(uid, { admin: providerID })
})
