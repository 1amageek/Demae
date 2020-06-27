import { Model, Field, DocumentReference } from "@1amageek/ballcap-admin"
import { CurrencyCode } from "../../common/Currency"

export default class SubscriptionItem extends Model {
	@Field subscribedBy!: string
	@Field publishedBy!: string
	@Field createdBy!: string
	@Field productReference?: DocumentReference
	@Field planReference!: DocumentReference
	@Field quantity: number = 0
	@Field taxRates: number = 0
	@Field amount: number = 0
	@Field currency: CurrencyCode = "USD"
	@Field metadata?: any
}
