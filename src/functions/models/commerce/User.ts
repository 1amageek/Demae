import { Doc, Field, firestore, CollectionReference } from '@1amageek/ballcap-admin'
import * as functions from 'firebase-functions'
import { Country } from '../../common/Country'

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
	@Field country: Country = 'JP'
	@Field currentOrderID?: string
	@Field defaultAddress?: any
	@Field defaultPaymentMethodID?: string
}
