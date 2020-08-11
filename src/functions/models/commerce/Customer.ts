import { Doc, Field, Model, firestore, CollectionReference, Codable } from "@1amageek/ballcap-admin"
import * as functions from "firebase-functions"

export class Stripe extends Model {
	@Field customerID!: string
	@Field link!: string
}

export default class Customer extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/customers")
	}

	@Codable(Stripe, true)
	@Field stripe?: Stripe


	static async getCustomerID(uid: string) {
		const customer = await Customer.get<Customer>(uid)
		if (!customer) {
			throw new functions.https.HttpsError("invalid-argument", "User have not Customer")
		}
		const customerID = customer.stripe?.customerID
		if (!customerID) {
			throw new functions.https.HttpsError("invalid-argument", "User have not Stripe customerID")
		}
		return customerID
	}
}
