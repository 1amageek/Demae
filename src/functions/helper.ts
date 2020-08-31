import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import Stripe from "stripe"

export const regionFunctions = functions.region("us-central1")

export const nullFilter = <T>(data: T) => {
	const mod = data
	Object.entries(mod).forEach(([key, val]) => {
		if (val === null) { delete mod[key as keyof T] }
		if (val === undefined) { delete mod[key as keyof T] }
		if (val instanceof Object) { mod[key as keyof T] = nullFilter(val) }
	})
	return mod
}

const STRIPE_API_KEY = functions.config().stripe.api_key

export const stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: "2020-08-27",
	// Register extension as a Stripe plugin
	// https://stripe.com/docs/building-plugins#setappinfo
	appInfo: {
		name: "Demae",
		version: "beta",
	},
});

export const getProviderID = async (uid: string) => {
	const user = await admin.auth().getUser(uid)
	const providerID = user.customClaims?.admin
	if (!providerID) return null
	return providerID
}
