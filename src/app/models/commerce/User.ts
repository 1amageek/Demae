import { Doc, Field, firestore, CollectionReference } from '@1amageek/ballcap'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: string = 'JP'
}
