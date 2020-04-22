import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, File } from '@1amageek/ballcap'
import { CurrencyCode } from 'common/Currency'
import Plan from './Plan'
import SKU from './SKU'

export type ProductType = 'service' | 'good' | 'ticket'

export default class Product extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/products')
	}

	@Field providedBy!: string
	@Field images: File[] = []
	@Field type: ProductType = 'good'
	@Field name: string = 'No Name'
	@Field caption?: string
	@Field description?: string
	@Field price: { [key in CurrencyCode]?: number } = {}
	@Field isAvailable: boolean = true
	@Field metadata?: any
	@SubCollection skus: Collection<SKU> = new Collection()
	@SubCollection plans: Collection<Plan> = new Collection()

	imageURLs(): string[] {
		return this.images.map(image => {
			if (image) {
				return `https://demae-210ed.firebaseapp.com/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value) as string[]
	}
}

export class ProductDraft extends Product {
	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/productdrafts')
	}
}
