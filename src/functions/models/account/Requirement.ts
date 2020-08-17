import { Doc, Field, CollectionReference, firestore } from "@1amageek/ballcap-admin"

interface Task {
	id: string
	action: string
}

export default class Requirement extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("account/v1/requirements")
	}

	@Field eventuallyDue: Task[] = []
	@Field currentlyDue: Task[] = []
}
