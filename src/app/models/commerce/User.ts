import { Doc, Field, firestore, CollectionReference, SubCollection, Collection, Codable } from '@1amageek/ballcap'
import { Country } from 'common/Country'
import Shipping from './Shipping'
import Order from './Order'
import { CurrencyCode } from 'common/Currency'

export class Role extends Doc {

}

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: Country = 'US'
	@Field currency: CurrencyCode = 'USD'
	@Field currentOrderID?: string
	@Codable(Shipping, true)
	@Field defaultShipping?: Shipping
	@Field defaultPaymentMethodID?: string

	@SubCollection roles: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}
