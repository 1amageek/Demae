import { Doc, Field, DocumentReference, SubCollection, Collection, Batch, File } from "@1amageek/ballcap"
import { CurrencyCode, Symbol } from "common/Currency"
import { Inventory, Discount } from "common/commerce/Types"
import { ShardType, ShardCharacters } from "./Shard"
import firebase from "firebase"

export class Stock extends Doc {
	@Field count: number = 0
}

export default class SKU extends Doc {

	@Field index: number = 0
	@Field images: File[] = []
	@Field assets: File[] = []
	@Field tags: string[] = []
	@Field providedBy!: string
	@Field createdBy!: string
	@Field shardCharacters: ShardType[] = ShardCharacters.slice(0, 3)
	@Field currency: CurrencyCode = "USD"
	@Field productReference?: DocumentReference
	@Field name: string = "NO NAME"
	@Field caption?: string
	@Field description?: string
	@Field price: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 8
	@Field inventory: Inventory = { type: "finite", quantity: 1 }
	@Field isPrivate: boolean = false
	@Field isAvailable: boolean = true
	@Field metadata?: any

	@SubCollection stocks: Collection<Stock> = new Collection()

	displayPrice() {
		const symbol = Symbol(this.currency)
		const price = this.price
		return `${symbol}${price.toLocaleString()}`
	}

	tax() {
		return Math.floor(this.price * this.taxRate / 100)
	}

	imagePaths(): string[] {
		return this.images.map(image => {
			if (image) {
				return image.path
			}
			return undefined
		}).filter(value => !!value) as string[]
	}

	imageURLs(): string[] {
		return this.images.map(image => {
			if (image) {
				return `${process.env.HOST}/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value) as string[]
	}

	async updateInventory(amount: number) {
		const updateInventory = firebase.functions().httpsCallable("commerce-v1-inventory-update")
		const result = await updateInventory({
			skuPath: this.path,
			amount: amount
		})
		console.log("[APP] inventory update", result)
	}

	async increaseInventory(amount: number) {
		const increaseInventory = firebase.functions().httpsCallable("commerce-v1-inventory-increase")
		const result = await increaseInventory({
			skuPath: this.path,
			amount: amount
		})
		console.log("[APP] inventory increase", result)
	}
}
