import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import Stripe from "stripe"

const STRIPE_API_KEY = functions.config().stripe.api_key

export const stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2020-03-02',
	// Register extension as a Stripe plugin
	// https://stripe.com/docs/building-plugins#setappinfo
	appInfo: {
		name: 'Firebase firestore-stripe-subscriptions',
		version: '0.1.2',
	},
});

export const getProviderID = async (uid: string) => {
	const user = await admin.auth().getUser(uid)
	const providerID = user.customClaims?.admin
	if (!providerID) return null
	return providerID
}
