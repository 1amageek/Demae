

// Account
export type BusinessType = 'individual' | 'company'
export type TosAcceptance = {
	date: number,
	ip: string,
	userAgent: string
}

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

export type Structure = 'government_instrumentality' | 'governmental_unit' | 'incorporated_non_profit' | 'multi_member_llc' | 'private_corporation' | 'private_partnership' | 'public_corporation' | 'public_partnership' | 'tax_exempt_government_instrumentality' | 'unincorporated_association' | 'unincorporated_non_profit'

export type Company = {
	address_kana?: Address
	address_kanji?: Address
	address?: Address
	directors_provided: boolean
	executives_provided: boolean
	name?: string
	name_kana?: string
	name_kanji?: string
	owners_provided: false
	phone?: string
	structure: Structure
	tax_id_provided: boolean
	tax_id?: string
	tax_id_registrar?: string
	vat_id?: string
}

export type Verification = {
	additional_document: {
		back: any
		front: any
	}
	document: {
		back: any
		front: any
	}
}

export type Individual = {
	address_kana?: Address
	address_kanji?: Address
	address?: Address
	dob: {
		day: number
		month: number
		year: number
	}
	email?: string
	first_name?: string
	first_name_kana?: string
	first_name_kanji?: string
	gender?: string
	id_number?: string
	last_name?: string
	last_name_kana?: string
	last_name_kanji?: string
	maiden_name?: string
	metadata?: any
	phone?: string
	ssn_last_4?: string
	verification?: Verification
}
