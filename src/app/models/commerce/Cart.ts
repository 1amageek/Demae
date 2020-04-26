import { firestore, Doc, Model, Field, File, DocumentReference, CollectionReference, Codable } from '@1amageek/ballcap'
import { CurrencyCode } from 'common/Currency'
import { Discount, ProductType } from 'common/commerce/Types'
import Shipping from './Shipping'
import SKU from './SKU'
import Product from './Product'
import ISO4217 from 'common/ISO4217'
import Order, { OrderItem } from './Order'


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
	@Field images: File[] = []
	@Field productType?: ProductType
	@Field productReference?: DocumentReference
	@Field skuReference?: DocumentReference
	@Field quantity: number = 1
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Field discount?: Discount
	@Field taxRate: number = 0
	@Field category: string = ''
	@Field name: string = ''
	@Field caption?: string
	@Field description?: string
	@Field metadata?: any

	displayPrice() {
		const symbol = ISO4217[this.currency].symbol
		const amount = this.amount
		return `${symbol}${amount.toLocaleString()}`
	}

	price() {
		return this.amount
	}

	subtotal() {
		if (this.discount) {
			if (this.discount.type === 'rate') {
				return this.amount - Math.floor(this.amount * this.discount.rate!)
			} else {
				return Math.max(this.amount - this.discount.amount!, 0)
			}
		}
		return this.amount * this.quantity
	}

	tax() {
		return Math.floor(this.subtotal() * this.taxRate)
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
}

export class CartGroup extends Model implements Accounting {
	@Field providerID!: string
	@Codable(CartItem)
	@Field items: CartItem[] = []
	@Field shippingDate?: any
	@Field estimatedArrivalDate?: any
	@Field currency: CurrencyCode = 'USD'
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
}

export default class Cart extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/carts')
	}

	@Field purchasedBy!: string
	@Field currency: CurrencyCode = 'USD'
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

	addSKU(product: Product, sku: SKU) {
		if (product.providedBy !== sku.providedBy) return
		let group = this.groups.find(group => group.providerID === sku.providedBy)
		if (!group) {
			group = new CartGroup()
			group.providerID = sku.providedBy
			group.currency = sku.currency
			this.groups.push(group)
		}

		if ((group.currency !== null) && (group.currency !== sku.currency)) {
			console.log(`[APP] invalid currency. The cart now contains ${group.currency}, but the added item is ${sku.currency}.`)
			return
		}

		const cartItem = group.items.find(value => value.skuReference!.path == sku.path)
		if (cartItem) {
			cartItem.quantity += 1
		} else {
			const cartItem: CartItem = new CartItem()
			cartItem.images = sku.images
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
			group.items.push(cartItem)
		}
	}

	deleteSKU(sku: SKU) {
		const group = this.groups.find(group => group.providerID === sku.providedBy)
		if (!group) return
		const cartItem = group.items.find(value => value.skuReference!.path == sku.path)
		if (cartItem) {
			cartItem.quantity -= 1
			if (cartItem.quantity <= 0) {
				cartItem.quantity = 0
				group.items = group.items.filter(item => item.skuReference!.path !== sku.path)
			}
		} else {
			group.items = group.items.filter(item => item.skuReference!.path !== sku.path)
		}
	}

	addItem(item: CartItem) {
		const group = this.groups.find(group => group.providerID === item.providedBy)
		if (!group) return
		const cartItem = group.items.find(value => value.skuReference!.path == item.skuReference!.path)
		if (cartItem) {
			cartItem.quantity += 1
		} else {
			group.items.push(item)
		}
	}

	subtractItem(item: CartItem) {
		const group = this.groups.find(group => group.providerID === item.providedBy)
		if (!group) return
		const cartItem = group.items.find(value => value.skuReference!.path == item.skuReference!.path)
		if (cartItem) {
			cartItem.quantity -= 1
			if (cartItem.quantity == 0) {
				this.deleteItem(item)
			}
		} else {
			group.items.push(item)
		}
	}

	deleteItem(item: CartItem) {
		const group = this.groups.find(group => group.providerID === item.providedBy)
		if (!group) return
		group.items = group.items.filter(value => value.skuReference!.path !== item.skuReference!.path)
	}

	order(purchasedBy: string, group: CartGroup) {
		const items = group.items.map(item => {
			const orderItem: OrderItem = new OrderItem()
			orderItem.images = item.images
			orderItem.name = item.name
			orderItem.productReference = item.productReference
			orderItem.skuReference = item.skuReference
			orderItem.productType = item.productType
			orderItem.quantity = item.quantity
			orderItem.currency = item.currency
			orderItem.discount = item.discount
			orderItem.taxRate = item.taxRate
			orderItem.category = item.category
			orderItem.description = item.description
			orderItem.metadata = item.metadata
			orderItem.status = 'none'
			return orderItem
		})
		const order: Order = new Order()
		order.purchasedBy = purchasedBy
		order.providerID = group.providerID
		order.title = `${items.map(item => item.name).join(', ')}`
		order.shipping = group.shipping
		order.shippingDate = group.shippingDate
		order.estimatedArrivalDate = group.estimatedArrivalDate
		order.currency = group.currency
		order.amount = group.total()
		order.items = items
		order.deliveryStatus = 'none'
		order.paymentStatus = 'none'
		order.isCancelled = false
		order.metadata = group.metadata
		return order.data({ convertDocumentReference: true })
	}
}
