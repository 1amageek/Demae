import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../helper"
import * as Transfer from "../../commerce/transfer"
import Stripe from "stripe"


const on = <T>(type: string, event: Stripe.Event, handler: (object: T) => void) => {
	if (event.type === type) {
		const data: Stripe.Event.Data = event.data
		const object: Stripe.Event.Data.Object = data.object
		handler(object as T)
	}
}

export default regionFunctions.https.onRequest(async (req, res) => {
	const sig = req.header("stripe-signature")
	const endpointSecret = functions.config().stripe.webhook_secret
	if (!sig) {
		res.status(400).end()
		return
	}
	const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)

	on<Stripe.PaymentIntent>("payment_intent.succeeded", event, async (paymentIntent) => {
		await Transfer.create(paymentIntent)
	})

	on<Stripe.Charge>("charge.refunded", event, async (charge) => {
		await Transfer.createReversal(charge)
	})

	res.header('Access-Control-Allow-Origin', '*')
	res.json({ received: true })
})
