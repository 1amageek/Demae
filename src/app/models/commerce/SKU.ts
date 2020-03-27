import { Doc, Field, DocumentReference, firestore, CollectionReference } from '@1amageek/ballcap'
import { Currency } from 'common/Currency'
import { Inventory, Discount } from 'common/commerce/Types'
import { ShardType, ShardCharacters } from 'common/Shard'

export default class SKU extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/SKUs')
	}

	@Field isAvailable: boolean = true
	@Field selledBy!: string
	@Field createdBy!: string
	@Field shardCharacters: ShardType[] = ShardCharacters.slice(0, 3)
	@Field currency: Currency = 'USD'
	@Field productReference?: DocumentReference
	@Field name!: string
	@Field caption!: string
	@Field amount: number = 0
	@Field discount: Discount | null = null
	@Field taxRate: number = 0
	@Field inventory: Inventory = { type: 'finite', quantity: 1 }
	@Field isPrivate: boolean = false
	@Field metadata?: any

	tax() {
		return Math.floor(this.amount * this.taxRate)
	}

	price() {
		return Math.floor(this.amount + this.tax())
	}
}
