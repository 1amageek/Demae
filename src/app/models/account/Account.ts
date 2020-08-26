import { Doc, Field, firestore, CollectionReference } from "@1amageek/ballcap"
import { BusinessType } from "common/commerce/account"
import { CurrencyCode } from "common/Currency"

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("account/v1/accounts")
	}

	@Field country: string = "US"
	@Field defaultCurrency: CurrencyCode = "USD"
	@Field businessType: BusinessType = "individual"
	@Field stripe?: { [key: string]: any }
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field hasLegalEntity: boolean = false
	@Field commissionRate: number = 10
	@Field balance: number = 0
	@Field metadata?: { [key: string]: any } = {}
}
