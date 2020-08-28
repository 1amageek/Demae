import { firestore, Doc, Model, Field, File, DocumentReference, CollectionReference, Codable } from "@1amageek/ballcap"
import { CurrencyCode, Symbol } from "common/Currency"
import { Discount } from "common/commerce/Types"
import Shipping from "./Shipping"
import SKU from "./SKU"
import Product, { ProductType, SalesMethod } from "./Product"
import Order, { OrderItem } from "./Order"


interface TotalTax {
	taxRate: number
	total: number
}

interface Accounting {

	// Price per item
	price(): number

	// Total price not tax included
	subtotal(): number

	// subtotal * taxRate
	tax(): number

	// Kind of tax rates
	taxRates(): number[]

	// total tax for tax rate
	taxes(): TotalTax[]

	// Total price tax included
	total(): number
}

class Deliverable extends Model {
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Codable(Shipping)
	@Field shipping?: Shipping
}

export class CartItem extends Deliverable implements Accounting {
	@Field providedBy!: string
	@Field mediatedBy?: string
	@Field images: File[] = []
	@Field productType?: ProductType
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: CurrencyCode = "USD"
	@Field amount: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field category: string = ""
	@Field name: string = ""
	@Field caption?: string
	@Field description?: string
	@Field metadata?: any

	imageURLs() {
		return this.images.map(image => {
			if (image) {
				return `${process.env.HOST}/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value)
	}

	price() {
		return this.amount
	}

	subtotal() {
		if (this.discount) {
			if (this.discount.type === "rate") {
				return this.amount - Math.floor(this.amount * this.discount.rate!)
			} else {
				return Math.max(this.amount - this.discount.amount!, 0)
			}
		}
		return this.amount * this.quantity
	}

	tax() {
		return Math.floor(this.subtotal() * this.taxRate / 100)
	}

	taxRates() {
		return [this.taxRate]
	}

	taxes() {
		return [{ taxRate: this.taxRate, total: this.tax() }]
	}

	total() {
		return this.subtotal() + this.tax()
	}

	static fromSKU(product: Product, sku: SKU) {
		const cartItem: CartItem = new CartItem()
		const images = sku.images.length > 0 ? sku.images : product.images
		cartItem.images = images
		cartItem.providedBy = sku.providedBy
		cartItem.productType = product.type
		cartItem.productReference = sku.productReference
		cartItem.skuReference = sku.documentReference
		cartItem.caption = sku.caption
		cartItem.description = sku.description
		cartItem.currency = sku.currency
		cartItem.amount = sku.price
		cartItem.discount = sku.discount
		cartItem.name = sku.name
		cartItem.taxRate = sku.taxRate
		cartItem.quantity = 1
		return cartItem
	}
}

export class CartGroup extends Model implements Accounting {
	@Field groupID!: string
	@Field providedBy!: string
	@Codable(CartItem)
	@Field items: CartItem[] = []
	@Field currency: CurrencyCode = "USD"
	@Field salesMethod: SalesMethod = "instore"
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any

	@Codable(Shipping)
	@Field shipping?: Shipping
	@Field metadata?: any

	price() {
		return this.items.reduce((prev, current) => {
			return prev + current.price()
		}, 0)
	}

	subtotal() {
		return this.items.reduce((prev, current) => {
			return prev + current.subtotal()
		}, 0)
	}

	tax() {
		return this.items.reduce((prev, current) => {
			return prev + current.tax()
		}, 0)
	}

	taxRates() {
		const taxes = this.items.reduce<number[]>((prev, current) => {
			return prev.concat(current.taxRates())
		}, [])
		return Array.from(new Set(taxes))
	}

	taxes() {
		return this.taxRates().map(taxRate => {
			const tatal = this.items.reduce((prev, current) => {
				const tax = current.taxes().find(item => item.taxRate === taxRate)
				return prev + (tax?.total || 0)
			}, 0)
			return { taxRate: taxRate, total: tatal }
		})
	}

	total() {
		return this.subtotal() + this.tax()
	}

	static fromSKU(product: Product, sku: SKU) {
		const group = new CartGroup()
		group.salesMethod = product.salesMethod
		group.providedBy = sku.providedBy
		group.currency = sku.currency
		return group
	}

	static ID(product: Product) {
		return `${product.providedBy}-${product.salesMethod}`
	}

	order(purchasedBy: string) {
		const items = this.items.map(item => {
			const orderItem: OrderItem = new OrderItem()
			orderItem.mediatedBy = item.mediatedBy
			orderItem.images = item.images
			orderItem.name = item.name
			orderItem.productReference = item.productReference
			orderItem.skuReference = item.skuReference
			orderItem.productType = item.productType
			orderItem.quantity = item.quantity
			orderItem.currency = item.currency
			orderItem.price = item.amount
			orderItem.amount = item.subtotal()
			orderItem.discount = item.discount
			orderItem.taxRate = item.taxRate
			orderItem.category = item.category
			orderItem.description = item.description
			orderItem.metadata = item.metadata
			orderItem.status = "none"
			return orderItem
		})
		const order: Order = new Order()
		order.purchasedBy = purchasedBy
		order.providedBy = this.providedBy
		order.title = `${items.map(item => item.name).join(", ")}`
		order.shipping = this.shipping
		order.shippingDate = this.shippingDate
		order.estimatedArrivalDate = this.estimatedArrivalDate
		order.currency = this.currency
		order.amount = this.total()
		order.items = items
		order.salesMethod = this.salesMethod
		order.deliveryStatus = "none"
		order.paymentStatus = "none"
		order.isCanceled = false
		order.metadata = this.metadata
		return order.data({ convertDocumentReference: true })
	}

	// -

	setSKU(product: Product, sku: SKU, mediatedBy: string | null) {
		if (product.providedBy !== sku.providedBy) return
		if (this.salesMethod !== product.salesMethod) return
		if ((this.currency !== null) && (this.currency !== sku.currency)) {
			console.log(`[APP] invalid currency. The cart now contains ${this.currency}, but the added item is ${sku.currency}.`)
			return
		}
		const cartItem: CartItem = CartItem.fromSKU(product, sku)
		if (mediatedBy) cartItem.mediatedBy = mediatedBy
		this.items = [cartItem]
	}

	addSKU(product: Product, sku: SKU, mediatedBy: string | null) {
		if (product.providedBy !== sku.providedBy) return
		if (this.salesMethod !== product.salesMethod) return
		if ((this.currency !== null) && (this.currency !== sku.currency)) {
			console.log(`[APP] invalid currency. The cart now contains ${this.currency}, but the added item is ${sku.currency}.`)
			return
		}
		const cartItem = this.items.find(value => value.skuReference!.path == sku.path)
		if (cartItem) {
			cartItem.quantity += 1
			if (mediatedBy) cartItem.mediatedBy = mediatedBy
		} else {
			const cartItem: CartItem = CartItem.fromSKU(product, sku)
			if (mediatedBy) cartItem.mediatedBy = mediatedBy
			this.items.push(cartItem)
		}
	}

	deleteSKU(sku: SKU) {
		const cartItem = this.items.find(value => value.skuReference!.path == sku.path)
		if (cartItem) {
			cartItem.quantity -= 1
			if (cartItem.quantity <= 0) {
				cartItem.quantity = 0
				this.items = this.items.filter(item => item.skuReference!.path !== sku.path)
			}
		} else {
			this.items = this.items.filter(item => item.skuReference!.path !== sku.path)
		}
	}

	addItem(item: CartItem) {
		const cartItem = this.items.find(value => value.skuReference!.path == item.skuReference!.path)
		if (cartItem) {
			cartItem.quantity += 1
		} else {
			this.items.push(item)
		}
	}

	subtractItem(item: CartItem) {
		const cartItem = this.items.find(value => value.skuReference!.path == item.skuReference!.path)
		if (cartItem) {
			cartItem.quantity -= 1
			if (cartItem.quantity == 0) {
				this.deleteItem(item)
			}
		} else {
			this.items.push(item)
		}
	}

	deleteItem(item: CartItem) {
		this.items = this.items.filter(value => value.skuReference!.path !== item.skuReference!.path)
	}
}

export default class Cart extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/carts")
	}

	@Field purchasedBy!: string
	@Field currency: CurrencyCode = "USD"
	@Field amount: number = 0
	@Codable(Shipping)
	@Field shipping?: Shipping
	@Codable(CartGroup)
	@Field groups: CartGroup[] = []
	@Field metadata?: any

	items() {
		return this.groups.reduce<CartItem[]>((prev, group) => {
			return prev.concat(group.items)
		}, [])
	}

	price() {
		return this.groups.reduce((prev, current) => {
			return prev + current.price()
		}, 0)
	}

	subtotal() {
		return this.groups.reduce((prev, current) => {
			return prev + current.subtotal()
		}, 0)
	}

	tax() {
		return this.groups.reduce((prev, current) => {
			return prev + current.tax()
		}, 0)
	}

	taxRates() {
		const taxes = this.groups.reduce<number[]>((prev, current) => {
			return prev.concat(current.taxRates())
		}, [])
		return Array.from(new Set(taxes))
	}

	taxes() {
		return this.taxRates().map(taxRate => {
			const tatal = this.groups.reduce((prev, current) => {
				const tax = current.taxes().find(item => item.taxRate === taxRate)
				return prev + (tax?.total || 0)
			}, 0)
			return { taxRate: taxRate, total: tatal }
		})
	}

	total() {
		return this.subtotal() + this.tax()
	}

	cartGroup(groupID: string) {
		return this.groups.find(group => group.groupID === groupID)
	}

	setCartGroup(cartGroup: CartGroup) {
		const group = this.groups.find(group => group.groupID === cartGroup.groupID)
		if (!group) {
			this.groups.push(cartGroup)
		}
	}

	order(group: CartGroup) {
		return group.order(this.id)
	}
}
