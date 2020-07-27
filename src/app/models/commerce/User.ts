import { Doc, Model, Field, firestore, CollectionReference, SubCollection, Collection, Codable } from "@1amageek/ballcap"
import { CountryCode } from "common/Country"
import Shipping from "./Shipping"
import Order from "./Order"
import Card from "./Card"
import { Role } from "./Provider"
import { CurrencyCode } from "common/Currency"

export class Stripe extends Model {
	@Field customerID!: string
	@Field link!: string
}


export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/users")
	}

	static async getCustomerID(uid: string) {
		const user = await User.get<User>(uid)
		if (!user) return null
		const customerID = user.stripe?.customerID
		if (!customerID) return null
		return customerID
	}

	@Codable(Stripe, true)
	@Field stripe?: Stripe
	@Field isAvailable: boolean = false
	@Field country: CountryCode = "US"
	@Field currency: CurrencyCode = "USD"
	@Field currentOrderID?: string
	@Codable(Shipping, true)
	@Field defaultShipping?: Shipping
	@Codable(Card, true)
	@Field defaultCard?: Card

	@SubCollection providers: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}
