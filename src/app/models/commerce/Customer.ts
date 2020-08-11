import { Doc, Field, Model, firestore, CollectionReference, Codable } from "@1amageek/ballcap"

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
}
