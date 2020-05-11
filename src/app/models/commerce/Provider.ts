import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, GeoPoint, File } from '@1amageek/ballcap'
import { CurrencyCode } from 'common/Currency'
import Product from './Product'
import Order from './Order'

export type Permission = 'read' | 'write' | 'owner'

export class Role extends Doc {
	@Field permissions: Permission[] = ['read', 'write', 'owner']
}

export default class Provider extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/providers')
	}

	@Field thumbnailImage?: File
	@Field coverImage?: File
	@Field name: string = ''
	@Field caption?: string
	@Field description?: string
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
	@SubCollection members: Collection<Role> = new Collection()

	thumbnailImageURL() {
		if (this.thumbnailImage) {
			return `${process.env.HOST}/assets/${this.thumbnailImage.path}`
		}
		return undefined
	}

	coverImageURL() {
		if (this.coverImage) {
			return `https://demae-210ed.firebaseapp.com/assets/${this.coverImage.path}`
		}
		return undefined
	}
}
