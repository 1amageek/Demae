


// Order
export type OrderItemType = 'sku' | 'tax' | 'shipping' | 'discount'
export type OrderItemStatus = 'none' | 'ordered' | 'changed' | 'cancelled'
export type DeliveryStatus = 'none' | 'pending' | 'delivering' | 'delivered' | 'failure'
export type OrderPaymentStatus = 'none' | 'rejected' | 'authorized' | 'paid' | 'cancelled' | 'failure' | 'cancel_failure'

// Plan
export type Interval = 'day' | 'week' | 'month' | 'year'
export type TiersMode = 'graduated' | 'volume'
export type Tier = {
	upTo: number;
	flatAmount?: number;
	unitAmount?: number;
};

// Product
export type ProductType = 'service' | 'good'

// SKU
export type StockType = 'bucket' | 'finite' | 'infinite'
export type StockValue = 'in_stock' | 'limited' | 'out_of_stock'
export type Inventory = {
	type: StockType
	quantity?: number
	value?: StockValue
}

// Subscription
export type SubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

export type Address = {
	city?: string
	country?: string
	line1?: string
	line2?: string
	postal_code?: string
	state?: string
	town?: string
}

export type DiscountType = 'absolute' | 'rate'

export type Discount = {
	type: DiscountType
	amount?: number
	rate?: number
}
