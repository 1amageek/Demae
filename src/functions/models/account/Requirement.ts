import { Doc, Field, CollectionReference, firestore } from "@1amageek/ballcap-admin"

export default class Requirement extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/requirements")
	}

	@Field eventuallyDue: string[] = []
	@Field currentlyDue: string[] = []
	@Field pastDue: string[] = []
	@Field pendingVerification: string[] = []
	@Field errors: string[] = []
}
