import { Address } from '../Types'

export type BusinessType = 'individual' | 'company' | 'non_profit' | 'government_entity'

export type TosAcceptance = {
	date: number,
	ip: string,
	userAgent: string
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
	additional_document?: {
		back?: string
		front?: string
	}
	document?: {
		back?: string
		front?: string
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

export type Create = {
	type: string
	country?: string
	email?: string
	requested_capabilities: string[]
	business_type: BusinessType
	company?: Company
	individual?: Individual
	metadata?: any
	tos_acceptance?: TosAcceptance
}
