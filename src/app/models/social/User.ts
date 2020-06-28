import { Doc, Field, CollectionReference, firestore } from "@1amageek/ballcap"

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("social/v1/users")
	}

	@Field isAvailable: boolean = true
	@Field country: string = "US"
	@Field name: string = "UNKNOWN"
	@Field screenName: string = "UNKNOWN"
	@Field location: string = ""
	@Field biography: string = ""
}
