import { Doc, Field, firestore, CollectionReference } from '@1amageek/ballcap-admin'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('social/v1/users')
	}

	@Field name: string = ''
	@Field location: string = ''
}
