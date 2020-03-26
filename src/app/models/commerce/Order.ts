import { Doc, Model, Field, File, DocumentReference, Timestamp, Codable } from '@1amageek/ballcap'
import { Currency } from 'common/Currency'
import { OrderItemType, OrderItemStatus, DeliveryStatus, OrderPaymentStatus, Discount } from 'common/commerce/Types'
import Shipping from './Shipping'

export class OrderItem extends Model {
	@Field type: OrderItemType = 'sku'
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: Currency = 'USD'
	@Field amount: number = 0
	@Field discount: Discount | null = null
	@Field taxRate: number = 0
	@Field status: OrderItemStatus = 'none'
	@Field category: string = ''
	@Field name: string = ''
	@Field caption: string = ''
	@Field metadata?: any

	tax() {
		return Math.floor(this.amount * this.taxRate)
	}

	subtotal() {
		if (this.discount) {
			if (this.discount.type === 'rate') {
				return this.amount - Math.floor(this.amount * this.discount.rate!)
			} else {
				return Math.max(this.amount - this.discount.amount!, 0)
			}
		}
		return this.amount
	}

	total() {
		return this.subtotal() + this.tax()
	}
}

export default class Order extends Doc {
	@Field parentID?: string
	@Field title?: string
	@Field image?: string
	@Field assets: File[] = []
	@Field purchasedBy!: string
	@Field selledBy!: string
	@Codable(Shipping)
	@Field shipping?: Shipping
	@Field paidAt?: Timestamp
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Field currency: Currency = 'USD'
	@Field amount: number = 0
	@Codable(OrderItem)
	@Field items: OrderItem[] = []
	@Field deliveryStatus: DeliveryStatus = 'none'
	@Field paymentStatus: OrderPaymentStatus = 'none'
	@Field isCancelled: boolean = false
	@Field metadata?: any
}

