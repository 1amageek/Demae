import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../helper"
import * as Transfer from "./Transfer"

export default regionFunctions.https.onRequest(async (req, res) => {
	const sig = req.header("stripe-signature")
	const endpointSecret = functions.config().stripe.webhook_secret
	if (!sig) {
		res.status(400).end()
		return
	}
	const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
	Transfer.onChargeSucceeded(event)
	res.header('Access-Control-Allow-Origin', '*')
	res.json({ received: true })
})
