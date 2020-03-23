import { Doc, Field, firestore, CollectionReference } from '@1amageek/ballcap-admin'
import * as functions from 'firebase-functions'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	static async getCustomerID(uid: string) {
		const user = await User.get<User>(uid)
		if (!user) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Customer')
		}
		const customerID = user.customerID
		if (!customerID) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Stripe customerID')
		}
		return customerID
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: string = 'JP'
	@Field currentOrderID?: string
}
