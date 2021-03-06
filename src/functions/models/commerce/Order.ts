import * as admin from "firebase-admin"
import { Doc, Model, Field, File, DocumentReference, Timestamp, Codable } from "@1amageek/ballcap-admin"
import { CurrencyCode } from "../../common/Currency"
import { OrderItemStatus, DeliveryStatus, PaymentStatus, RefundStatus, TransferStatus, Discount } from "../../common/commerce/Types"
import { ProductType, SalesMethod } from "./Product"
import Shipping from "./Shipping"

export type DeliveryMethod = "none"

export class OrderItem extends Model {
	@Field images: File[] = []
	@Field mediatedBy?: string
	@Field productType?: ProductType
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: CurrencyCode = "USD"
	@Field amount: number = 0
	@Field price: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field status: OrderItemStatus = "none"
	@Field category: string = ""
	@Field name: string = ""
	@Field caption?: string
	@Field description?: string
	@Field metadata?: any
}

export default class Order extends Doc {
	@Field parentID?: string
	@Field title?: string
	@Field purchasedBy!: string
	@Field providedBy!: string
	@Field tags: string[] = []
	@Codable(Shipping)
	@Field shipping?: Shipping
	@Field paidAt?: Timestamp | admin.firestore.FieldValue
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Field currency: CurrencyCode = "USD"
	@Field amount: number = 0
	@Codable(OrderItem)
	@Field items: OrderItem[] = []
	@Field salesMethod: SalesMethod = "instore"
	@Field deliveryMethod: DeliveryMethod = "none"
	@Field deliveryStatus: DeliveryStatus = "none"
	@Field paymentStatus: PaymentStatus = "none"
	@Field refundStatus: RefundStatus = "none"
	@Field transferStatus: TransferStatus = "none"
	@Field isCanceled: boolean = false
	@Field paymentResult?: any
	@Field paymentCancelResult?: any
	@Field refundResult?: any
	@Field transferResults?: any[]
	@Field transferReversalResults?: any[]
	@Field metadata?: any
}

export class Comment extends Model {
	@Field text: string = ""
	@Field attachedFiles: File[] = []
}

export class Assign extends Model {
	@Field assignees: string[] = []
}

export class ChangeDeliveryStatus extends Model {
	@Field beforeStatus: DeliveryStatus = "none"
	@Field afterStatus: DeliveryStatus = "none"
}

export class Activty extends Doc {
	@Field authoredBy!: string
	@Codable(Comment)
	@Field comment?: Comment
	@Codable(Assign)
	@Field assign?: Assign
	@Codable(ChangeDeliveryStatus)
	@Field changeDeliveryStatus?: ChangeDeliveryStatus
	@Field metadata?: any
}
