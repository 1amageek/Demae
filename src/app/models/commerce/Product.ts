import { Doc, Field, Collection, SubCollection, firestore, CollectionReference } from '@1amageek/ballcap'
import Plan from './Plan'
import SKU from './SKU'

export type ProductType = 'service' | 'good'

export default class Product extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/products')
	}

	@Field type: ProductType = 'good'
	@Field name: string = ""
	@Field caption?: string
	@Field description?: string
	@Field isAvailable: boolean = true
	@Field metadata?: any
	@SubCollection skus: Collection<SKU> = new Collection()
	@SubCollection plans: Collection<Plan> = new Collection()
}
