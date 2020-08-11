import { Doc, Field, Model, Codable, firestore, CollectionReference } from "@1amageek/ballcap"
import { BusinessType } from "common/commerce/account"
import { CurrencyCode } from "common/Currency"

export class Stripe extends Model {
	@Field accountID?: string
	@Field link!: string
}

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("account/v1/accounts")
	}

	@Codable(Stripe, true)
	@Field stripe?: Stripe
	@Field country: string = "US"
	@Field defaultCurrency: CurrencyCode = "USD"
	@Field businessType: BusinessType = "individual"
	@Field company?: { [key: string]: any }
	@Field individual?: { [key: string]: any }
	@Field email!: string
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field hasLegalEntity: boolean = false
	@Field commissionRate: number = 10
	@Field balance: number = 0
	@Field metadata?: { [key: string]: any } = {}
}
