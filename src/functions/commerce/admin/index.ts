import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import User from "../../models/commerce/User"

export const attach = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_API_KEY.")
	}
	console.info(context)
	const uid: string = context.auth.uid
	const providerID = data.providerID
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an providerID.")
	}
	const snapshot = await new User(uid).providers.collectionReference.doc(providerID).get()
	if (!snapshot.exists) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have the authority of the provider..")
	}
	try {
		await admin.auth().setCustomUserClaims(uid, { admin: providerID })
		return {
			result: { providerID }
		}
	} catch (error) {
		console.error(error)
		return { error }
	}
})
