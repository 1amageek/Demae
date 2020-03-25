import { Doc, Field, firestore, CollectionReference, SubCollection, Collection, Codable } from '@1amageek/ballcap'
import Address from './Address'
import { Country } from 'common/Country'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: Country = 'US'
	@Field currentOrderID?: string
	@Codable(Address)
	@Field defaultAddress?: Address
	@Field defaultPaymentMethodID?: string

	@SubCollection addresses: Collection<Address> = new Collection()
}
