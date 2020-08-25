import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import { stripe } from "../../helper"
import Account from "../../models/account/Account"

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	console.info(context)
	const uid: string = context.auth.uid
	const { external_account } = data
	if (!external_account) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an external_account.")
	}
	const accountID = await Account.getAccountID(uid)
	if (!accountID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a accountID.")
	}
	try {
		const result = await stripe.accounts.createExternalAccount(accountID, data)
		return { result }
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw }
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
