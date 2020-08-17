import { Doc, Field, CollectionReference, firestore } from "@1amageek/ballcap"

interface Task {
	message: string
	action: string
}

export default class Requirement extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/requirements")
	}

	@Field eventuallyDue: Task[] = []
	@Field currentlyDue: Task[] = []
}
