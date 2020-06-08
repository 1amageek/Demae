import { firestore, Doc, Model, Field, File, DocumentReference, CollectionReference, Codable } from '@1amageek/ballcap-admin'
import { CurrencyCode } from '../../common/Currency'
import { Discount, ProductType } from '../../common/commerce/Types'
import Shipping from './Shipping'


class Deliverable extends Model {
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Codable(Shipping)
	@Field shipping?: Shipping
}

export class CartItem extends Deliverable {
	@Field providedBy!: string
	@Field mediatedBy?: string
	@Field images: File[] = []
	@Field productType?: ProductType
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field category: string = ''
	@Field name: string = ''
	@Field caption?: string
	@Field description?: string
	@Field metadata?: any
}

export class CartGroup extends Model {
	@Field groupID!: string
	@Field providedBy!: string
	@Codable(CartItem)
	@Field items: CartItem[] = []
	@Field currency: CurrencyCode = 'USD'
	@Field isShippable: boolean = false
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any

	@Codable(Shipping)
	@Field shipping?: Shipping
	@Field metadata?: any

}

export default class Cart extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/carts')
	}

	@Field purchasedBy!: string
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Codable(Shipping)
	@Field shipping?: Shipping
	@Codable(CartGroup)
	@Field groups: CartGroup[] = []
	@Field metadata?: any
}
