import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import Stripe from "stripe"
import Account from "../../models/account/Account"

type Response = {
	result?: any
	error?: any
}

export const retrieve = regionFunctions.https.onCall(async (_, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	console.info(context)
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const accountID = await Account.getAccountID(uid)
	if (!accountID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a accountID.")
	}
	try {
		const result = await stripe.balance.retrieve({}, { stripeAccount: accountID })
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
