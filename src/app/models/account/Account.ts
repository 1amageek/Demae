import { Doc, Field, Model, Codable, firestore, CollectionReference } from "@1amageek/ballcap"
import { BusinessType } from "common/commerce/account"
import { CurrencyCode } from "common/Currency"

export class Stripe extends Model {
	@Field customerID!: string
	@Field accountID?: string
	@Field link!: string
}

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("account/v1/accounts")
	}

	static async getCustomerID(uid: string) {
		const account = await Account.get<Account>(uid)
		if (!account) return null
		const customerID = account.stripe?.customerID
		if (!customerID) return null
		return customerID
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
