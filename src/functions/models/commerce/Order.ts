import { Doc, Model, Field, File, DocumentReference, Timestamp, Codable } from '@1amageek/ballcap-admin'
import { CurrencyCode } from '../../common/Currency'
import { OrderItemStatus, DeliveryStatus, PaymentStatus, Discount } from '../../common/commerce/Types'
import { ProductType, DeliveryMethod } from './Product'
import Shipping from './Shipping'

export class OrderItem extends Model {
	@Field images: File[] = []
	@Field mediatedBy?: string
	@Field productType?: ProductType
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Field price: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field status: OrderItemStatus = 'none'
	@Field category: string = ''
	@Field name: string = ''
	@Field caption?: string
	@Field description?: string
	@Field metadata?: any
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
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Codable(OrderItem)
	@Field items: OrderItem[] = []
	@Field deliveryMethod: DeliveryMethod = 'none'
	@Field deliveryStatus: DeliveryStatus = 'none'
	@Field paymentStatus: PaymentStatus = 'none'
	@Field isCancelled: boolean = false
	@Field paymentResult?: any
	@Field metadata?: any
}
