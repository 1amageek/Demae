import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../helper"

type Response = {
	result?: any
	error?: any
}

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	const ACCOUNT_ID = functions.config().stripe.account
	if (!ACCOUNT_ID) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires ACCOUNT_ID.")
	}
	const return_url = functions.config().stripe.account_link_success_url
	if (!return_url) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires return_url.")
	}
	const refresh_url = functions.config().stripe.account_link_failure_url
	if (!refresh_url) {
		throw new functions.https.HttpsError("invalid-argument", "The functions requires refresh_url.")
	}
	console.info(context)
	try {
		const result = await stripe.accountLinks.create({
			account: ACCOUNT_ID,
			return_url,
			refresh_url,
			type: "custom_account_verification",
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
