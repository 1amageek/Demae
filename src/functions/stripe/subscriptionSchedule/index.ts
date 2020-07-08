import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import Stripe from "stripe"

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
	const params = data["params"]
	const options = data["options"]
	try {
		const result = await stripe.subscriptionSchedules.create(params, options)
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
	const id = data["id"]
	const params = data["params"]
	const options = data["options"]
	if (!id) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires `id` in data.")
	}
	try {
		const result = await stripe.subscriptionSchedules.retrieve(id, params, options)
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
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const id = data["id"]
	const params = data["params"]
	const options = data["options"]
	if (!id) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires `id` in data.")
	}
	if (!params) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires params in data.")
	}
	try {
		const result = await stripe.subscriptionSchedules.update(id, params, options)
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
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const params = data["params"]
	const options = data["options"]
	if (!options) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires options in data.")
	}
	try {
		const result = await stripe.subscriptionSchedules.list(params, options)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const release = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const id = data["id"]
	const params = data["params"]
	const options = data["options"]
	if (!id) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires `id` in data.")
	}
	try {
		const result = await stripe.subscriptionSchedules.release(id, params, options)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})

export const cancel = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: "2020-03-02" })
	const id = data["id"]
	const params = data["params"]
	const options = data["options"]
	if (!id) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires `id` in data.")
	}
	try {
		const result = await stripe.subscriptionSchedules.cancel(id, params, options)
		return { result } as Response
	} catch (error) {
		functions.logger.error(error)
		if (error.raw) {
			return { error: error.raw } as Response
		}
		throw new functions.https.HttpsError("invalid-argument", "Invalid argument.")
	}
})
