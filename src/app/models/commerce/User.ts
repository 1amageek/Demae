import { Doc, Field, firestore, CollectionReference, SubCollection, Collection, Codable } from '@1amageek/ballcap'
import { CountryCode } from 'common/Country'
import Shipping from './Shipping'
import Order from './Order'
import { Role } from './Provider'
import { CurrencyCode } from 'common/Currency'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: CountryCode = 'US'
	@Field currency: CurrencyCode = 'USD'
	@Field currentOrderID?: string
	@Codable(Shipping, true)
	@Field defaultShipping?: Shipping
	@Field defaultPaymentMethodID?: string

	@SubCollection providers: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}
