import firebase from "firebase"
import { Doc, Model, Field, File, DocumentReference, SubCollection, Collection, Timestamp, Codable } from "@1amageek/ballcap"
import { CurrencyCode } from "common/Currency"
import { OrderItemStatus, DeliveryStatus, PaymentStatus, RefundStatus, Discount } from "common/commerce/Types"
import { ProductType, DeliveryMethod } from "./Product"
import Shipping from "./Shipping"

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

	imageURLs() {
		return this.images
			.map(image => {
				if (image) {
					return `${process.env.HOST}/assets/${image.path}`
				}
				return undefined
			}).filter(value => !!value)
	}
}

export default class Order extends Doc {
	@Field parentID?: string
	@Field title?: string
	@Field purchasedBy!: string
	@Field providedBy!: string
	@Codable(Shipping)
	@Field shipping?: Shipping
	@Field paidAt?: Timestamp
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Field currency: CurrencyCode = "USD"
	@Field amount: number = 0
	@Codable(OrderItem)
	@Field items: OrderItem[] = []
	@Field deliveryMethod: DeliveryMethod = "none"
	@Field deliveryStatus: DeliveryStatus = "none"
	@Field paymentStatus: PaymentStatus = "none"
	@Field refundStatus: RefundStatus = "none"
	@Field isCanceled: boolean = false
	@Field paymentResult?: any
	@Field paymentCancelResult?: any
	@Field refundResult?: any
	@Field transferResults?: any[]
	@Field metadata?: any

	@SubCollection activities: Collection<Activity> = new Collection()

	imageURLs() {
		return this.items
			.reduce<File[]>((prev, item) => {
				return prev.concat(item.images)
			}, [])
			.map(image => {
				if (image) {
					return `${process.env.HOST}/assets/${image.path}`
				}
				return undefined
			}).filter(value => !!value)
	}

	cancel() {
		const orderCancel = firebase.functions().httpsCallable("commerce-v1-order-cancel")
		return orderCancel({ orderID: this.id })
	}
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

export class ChangePaymentStatus extends Model {
	@Field beforeStatus: PaymentStatus = "none"
	@Field afterStatus: PaymentStatus = "none"
}

export class OrderCancel extends Model {
	@Field comment: string = ""
}

export class OrderRefund extends Model {
	@Field comment: string = ""
}

export class Activity extends Doc {
	@Field authoredBy!: string
	@Codable(Comment)
	@Field comment?: Comment
	@Codable(Assign)
	@Field assign?: Assign
	@Codable(ChangeDeliveryStatus)
	@Field changeDeliveryStatus?: ChangeDeliveryStatus
	@Codable(ChangePaymentStatus)
	@Field changePaymentStatus?: ChangePaymentStatus
	@Codable(OrderCancel)
	@Field orderCancel?: OrderCancel
	@Codable(OrderRefund)
	@Field orderRefund?: OrderRefund
	@Field metadata?: any
}
