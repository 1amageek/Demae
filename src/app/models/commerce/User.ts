import { Doc, Field, firestore, CollectionReference, SubCollection, Collection, Codable, Model } from '@1amageek/ballcap'
import { CountryCode } from 'common/Country'
import Shipping from './Shipping'
import Order from './Order'
import { Role } from './Provider'
import { CurrencyCode } from 'common/Currency'

export class Card extends Model {
	@Field brand!: string
	@Field expMonth!: number
	@Field expYear!: number
	@Field last4!: string
	@Field id!: string
}

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
	@Codable(Card, true)
	@Field defaultCard?: Card
	@Field defaultPaymentMethodID?: string

	@SubCollection providers: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}
