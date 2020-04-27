import { Doc, Field, DocumentReference, SubCollection, Collection, Batch, File } from '@1amageek/ballcap'
import { CurrencyCode } from 'common/Currency'
import { Inventory, Discount } from 'common/commerce/Types'
import { ShardType, ShardCharacters } from './Shard'
import ISO4217 from 'common/ISO4217'
import firebase from 'firebase'

export class Stock extends Doc {
	@Field count: number = 0
}

export default class SKU extends Doc {

	@Field images: File[] = []
	@Field assets: File[] = []
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

	@SubCollection inventories: Collection<Stock> = new Collection()

	displayPrice() {
		const symbol = ISO4217[this.currency].symbol
		const price = this.price
		return `${symbol}${price.toLocaleString()}`
	}

	tax() {
		return Math.floor(this.price * this.taxRate)
	}

	imageURLs() {
		return this.images.map(image => {
			if (image) {
				return `https://demae-210ed.firebaseapp.com/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value)
	}

	async updateInventory(amount: number) {
		const updateInventory = firebase.functions().httpsCallable('v1-commerce-inventory-update')
		const result = await updateInventory({
			skuPath: this.path,
			amount: amount
		})
		console.log('[APP] inventory update', result)
	}

	async increaseInventory(amount: number) {
		const increaseInventory = firebase.functions().httpsCallable('v1-commerce-inventory-increase')
		const result = await increaseInventory({
			skuPath: this.path,
			amount: amount
		})
		console.log('[APP] inventory increase', result)
	}
}
