import { stripe } from "../../../helper"
import Stripe from "stripe"

export const onChargeSucceeded = (event: Stripe.Event) => {

	if (event.type === "payment_intent.succeeded") {
		const data: Stripe.Event.Data = event.data
		const object: Stripe.Event.Data.Object = data.object

		console.log(object)
	}
}
