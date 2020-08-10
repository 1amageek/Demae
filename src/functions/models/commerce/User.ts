import { Doc, Field, firestore, CollectionReference, Codable, SubCollection, Collection } from "@1amageek/ballcap-admin"
import { CountryCode } from "../../common/Country"
import { CurrencyCode } from "../../common/Currency"
import Shipping from "./Shipping"
import Order from "./Order"
import Card from "./Card"
import { Role } from "./Provider"

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/users")
	}

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
