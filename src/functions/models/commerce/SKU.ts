import { Doc, Field, DocumentReference, firestore, CollectionReference } from '@1amageek/ballcap-admin'
import { Currency } from '../../util/Currency'

export default class SKU extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/SKUs')
	}

	@Field isAvailable: boolean = true
	@Field selledBy!: string
	@Field createdBy!: string
	@Field numberOfFetch: number = 5
	@Field currency: Currency = 'JPY'
	@Field productReference?: DocumentReference
	@Field name!: string
	@Field caption!: string
	@Field amount: number = 0
	@Field inventory: Inventory = { type: 'finite', quantity: 1 }
	@Field isPrivate: boolean = false
	@Field metadata?: any
}

export type StockType = 'bucket' | 'finite' | 'infinite'

export type StockValue = 'in_stock' | 'limited' | 'out_of_stock'

export type Inventory = {
	type: StockType
	quantity?: number
	value?: StockValue
}
