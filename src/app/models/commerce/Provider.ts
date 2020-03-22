import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, GeoPoint } from '@1amageek/ballcap'
import { Currency } from 'common/Currency'
import Product from './Product'

export default class Provider extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/providers')
	}

	@Field name: string = ''
	@Field caption: string = ''
	@Field description: string = ''
	@Field country: string = 'US'
	@Field defaultCurrency: Currency = 'USD'
	@Field email: string = ''
	@Field location?: GeoPoint
	@Field address?: string
	@Field isAvailable: boolean = false
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field metadata?: { [key: string]: any } = {}

	@SubCollection products: Collection<Product> = new Collection()
}
