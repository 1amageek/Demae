import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import Stripe from "stripe"
import Account from "../../models/account/Account"
export * from "./createExternalAccount"

type Response = {
	result?: any
	error?: any
}

export const create = regionFunctions.https.onCall(async (data, context) => {
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
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const update = regionFunctions.https.onCall(async (data, context) => {
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
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.update(accountID, data)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

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
	try {
		const accountID = await Account.getAccountID(uid)
		const result = await stripe.accounts.retrieve(accountID)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
