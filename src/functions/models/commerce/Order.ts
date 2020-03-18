import { Doc, Model, Field, File, firestore, CollectionReference, DocumentReference, Timestamp } from '@1amageek/ballcap-admin'
import { Currency } from '../../util/Currency'

export type OrderItemType = 'sku' | 'tax' | 'shipping' | 'discount'
export type OrderItemStatus = 'none' | 'ordered' | 'changed' | 'cancelled'
export type DeliveryStatus = 'none' | 'pending' | 'delivering' | 'delivered' | 'failure'
export type OrderPaymentStatus = 'none' | 'rejected' | 'authorized' | 'paid' | 'cancelled' | 'failure' | 'cancel_failure'

export class OrderItem extends Model {
	@Field purchasedBy!: string
	@Field selledBy: string = ''
	@Field createdBy: string = ''
	@Field type: OrderItemType = 'sku'
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: Currency = 'USD'
	@Field amount: number = 0
	@Field status: OrderItemStatus = 'none'
	@Field category: string = ''
	@Field name: string = ''
	@Field metadata?: any
}

export default class Order extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/1/orders')
	}

	@Field parentID?: string
	@Field type?: string
	@Field title?: string
	@Field image?: string
	@Field assets: File[] = []
	@Field purchasedBy!: string
	@Field selledBy!: string
	@Field shippingTo!: { [key: string]: string }
	@Field transferredTo: DocumentReference[] = []
	@Field paidAt?: Timestamp
	@Field expirationDate?: Timestamp
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Field currency: Currency = 'USD'
	@Field amount: number = 0
	@Field items: OrderItem[] = []
	@Field deliveryStatus: DeliveryStatus = 'none'
	@Field paymentStatus: OrderPaymentStatus = 'none'
	@Field isCancelled: boolean = false
	@Field metadata?: any
}
