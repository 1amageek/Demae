import { Doc, Field, firestore, CollectionReference, SubCollection, Collection } from '@1amageek/ballcap'
import Address from './Address'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: string = 'JP'
	@Field currentOrderID?: string
	@Field defaultAddress?: string
	@Field defaultPaymentMethod?: string

	@SubCollection addresses: Collection<Address> = new Collection()
}
