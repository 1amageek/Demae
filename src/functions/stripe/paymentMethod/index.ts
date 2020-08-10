import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import Stripe from "stripe"
import User from "../../models/commerce/User"
import Account from "../../models/account/Account"

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
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })

	try {
		const result = await stripe.paymentMethods.create(data)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const retrieve = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const paymentMethodId = data["paymentMethodID"]
	if (!paymentMethodId) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires paymentMethodID in data.")
	}
	try {
		const result = await stripe.paymentMethods.retrieve(paymentMethodId)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const list = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const type = data["type"] || "card"
	try {
		const customerID = await Account.getCustomerID(uid)
		const result = await stripe.paymentMethods.list({
			customer: customerID,
			type: type
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

export const attach = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const uid: string = context.auth.uid
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const paymentMethodId = data["paymentMethodID"]
	if (!paymentMethodId) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires paymentMethodID in data.")
	}
	try {
		const customerID = await Account.getCustomerID(uid)
		const result = await stripe.paymentMethods.attach(paymentMethodId, {
			customer: customerID
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

export const detach = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const paymentMethodId = data["paymentMethodID"]
	if (!paymentMethodId) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires paymentMethodID in data.")
	}
	try {
		const result = stripe.paymentMethods.detach(paymentMethodId)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
