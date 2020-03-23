import { firestore, CollectionReference } from '@1amageek/ballcap'
import Order, { OrderItem } from './Order'
import SKU from './SKU'


export default class Cart extends Order {
	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/carts')
	}

	addItem(sku: SKU) {
		const orderItem = this.items.find(value => value.skuReference!.path == sku.path)
		if (orderItem) {
			orderItem.quantity += 1
		} else {
			const orderItem: OrderItem = new OrderItem()
			orderItem.type = 'sku'
			orderItem.productReference = sku.productReference
			orderItem.skuReference = sku.documentReference
			orderItem.currency = sku.currency
			orderItem.amount = sku.amount
			orderItem.discount = sku.discount
			orderItem.name = sku.name
			orderItem.quantity = 1
			this.items.push(orderItem)
		}
	}

	subtractItem(item: OrderItem) {
		const orderItem = this.items.find(value => value.skuReference!.path == item.skuReference!.path)
		if (orderItem) {
			orderItem.quantity -= 1
			if (orderItem.quantity == 0) {
				this.deleteItem(item)
			}
		} else {
			this.items.push(item)
		}
	}

	deleteItem(item: OrderItem) {
		this.items.filter(value => value.skuReference!.path !== item.skuReference!.path)
	}
}
