import { Doc, Field, Collection, SubCollection, CollectionReference, firestore, GeoPoint, File } from '@1amageek/ballcap-admin'
import { CurrencyCode } from '../../common/Currency'
import Product from './Product'
import Order from './Order'

export default class Provider extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/providers')
	}

	@Field thumbnailImage?: File
	@Field coverImage?: File
	@Field name: string = ''
	@Field caption: string = ''
	@Field description: string = ''
	@Field country: string = 'US'
	@Field defaultCurrency: CurrencyCode = 'USD'
	@Field email: string = ''
	@Field phone: string = ''
	@Field location?: GeoPoint
	@Field address?: string
	@Field isAvailable: boolean = false
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field metadata?: { [key: string]: any } = {}

	@SubCollection products: Collection<Product> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()
}
