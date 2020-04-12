import { Doc, Field, DocumentReference, SubCollection, Collection, Batch, File } from '@1amageek/ballcap'
import { Currency } from 'common/Currency'
import { Inventory, Discount } from 'common/commerce/Types'
import { ShardType, ShardCharacters } from './Shard'

export class Stock extends Doc {
	@Field count: number = 0
}

export default class SKU extends Doc {

	@Field images: File[] = []
	@Field selledBy!: string
	@Field createdBy!: string
	@Field shardCharacters: ShardType[] = ShardCharacters.slice(0, 3)
	@Field currency: Currency = 'USD'
	@Field productReference?: DocumentReference
	@Field name!: string
	@Field caption?: string
	@Field description?: string
	@Field amount: number = 0
	@Field discount: Discount | null = null
	@Field taxRate: number = 0
	@Field inventory: Inventory = { type: 'finite', quantity: 1 }
	@Field isPrivate: boolean = false
	@Field isAvailable: boolean = true
	@Field metadata?: any

	@SubCollection inventories: Collection<Stock> = new Collection()

	tax() {
		return Math.floor(this.amount * this.taxRate)
	}

	price() {
		return Math.floor(this.amount + this.tax())
	}

	imageURLs() {
		return this.images.map(image => {
			if (image) {
				return `https://demae-210ed.firebaseapp.com/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value)
	}

	async updateInventory() {
		if (this.inventory.type !== 'finite') {
			return
		}
		if (!this.inventory.quantity) {
			return
		}
		const qty = Math.floor(this.inventory.quantity / this.shardCharacters.length)
		const batch = new Batch()
		this.shardCharacters.forEach(shard => {
			const stock = new Stock(this.inventories.collectionReference.doc(shard))
			stock.count = qty
			batch.save(stock)
		})
		await batch.commit()
	}
}
