import { Doc, Field, firestore, CollectionReference, Codable, SubCollection, Collection } from '@1amageek/ballcap-admin'
import * as functions from 'firebase-functions'
import { Country } from '../../common/Country'
import Shipping from './Shipping'
import Order from './Order'

export class Role extends Doc {

}

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
	@Field country: Country = 'US'
	@Field currentOrderID?: string
	@Codable(Shipping)
	@Field defaultShipping?: Shipping
	@Field defaultPaymentMethodID?: string

	@SubCollection roles: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}
