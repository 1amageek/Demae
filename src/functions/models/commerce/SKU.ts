import { Doc, Field, DocumentReference, SubCollection, Collection } from '@1amageek/ballcap-admin'
import { CurrencyCode } from '../../common/Currency'
import { Inventory, Discount } from '../../common/commerce/Types'
import { ShardType, ShardCharacters } from '../../common/Shard'

export class Stock extends Doc {
	@Field count: number = 0
}

export default class SKU extends Doc {
	@Field images: File[] = []
	@Field assets: File[] = []
	@Field tags: string[] = []
	@Field providedBy!: string
	@Field createdBy!: string
	@Field shardCharacters: ShardType[] = ShardCharacters.slice(0, 3)
	@Field currency: CurrencyCode = 'USD'
	@Field productReference?: DocumentReference
	@Field name!: string
	@Field caption?: string
	@Field description?: string
	@Field price: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field inventory: Inventory = { type: 'finite', quantity: 1 }
	@Field isPrivate: boolean = false
	@Field isAvailable: boolean = true
	@Field metadata?: any

	@SubCollection stocks: Collection<Stock> = new Collection()
}
