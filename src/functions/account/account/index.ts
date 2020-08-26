import * as functions from 'firebase-functions'
import { regionFunctions } from "../../helper"
import { stripe } from '../../helper'
import Account from "../../models/account/Account"

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const uid: string = context.auth.uid
	const account = new Account(uid)
	const snapshot = await account.documentReference.get()

	if (snapshot.exists) {
		const accountID = snapshot.data()!["stripe"]["accountID"]
		if (accountID) throw new functions.https.HttpsError("already-exists", "Account already exists.")
	}

	try {
		const result = await stripe.accounts.create({
			...data,
			tos_acceptance: {
				date: Math.floor(Date.now() / 1000),
				ip: context.rawRequest.ip
			},
			metadata: {
				uid: uid
			}
		})
		account.stripe = result
		await account.save()
		return { result }
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw }
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const update = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const uid: string = context.auth.uid
	const account = new Account(uid)
	const snapshot = await account.documentReference.get()
	if (!snapshot.exists) throw new functions.https.HttpsError("invalid-argument", "Account does not exist.")
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.update(accountID, data)
		await account.documentReference.set({
			stripe: result
		}, { merge: true })
		return { result }
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw }
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const retrieve = regionFunctions.https.onCall(async (_, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const uid: string = context.auth.uid
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.retrieve(accountID)
		return { result }
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw }
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
