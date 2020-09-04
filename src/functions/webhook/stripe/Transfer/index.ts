import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, stripe } from "../../../helper"
import Stripe from "stripe"

export const onChargeSucceeded = (event: Stripe.Event) => {

	if (event.type === "charge.succeeded") {
		const data: Stripe.Event.Data = event.data
		const object: Stripe.Event.Data.Object = data.object

		console.log(object)
	}
}
