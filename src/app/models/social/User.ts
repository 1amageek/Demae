import { Doc, Field, CollectionReference, firestore } from "@1amageek/ballcap"

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('social/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = true
	@Field country: string = 'US'
}
