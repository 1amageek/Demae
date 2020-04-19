import { Doc, Field } from '@1amageek/ballcap'
import { Address } from 'common/commerce/Types'
import { Country } from 'common/Country'

export type AddressType = 'city' | 'line1' | 'line2' | 'postal_code' | 'state'

export default class Shipping extends Doc {

	@Field address?: Address
	@Field name?: string
	@Field phone?: string

	formatted(country: Country = 'US') {
		return `${
			(this.name || "") +
			" " +
			(this.address?.line1 || "") +
			" " +
			(this.address?.line2 || "") +
			" " +
			(this.address?.city || "") +
			" " +
			(this.address?.state || "")}`
	}

	format(types: AddressType[]) {
		return types.reduce((prev, type) => {
			return prev + " " + (this.address ? this.address[type] : "")
		}, "")
	}

	isEqual(shipping?: Shipping): boolean {
		if (!shipping) return false
		return this.name === shipping.name &&
			this.phone === shipping.phone &&
			this.address?.country === shipping.address?.country &&
			this.address?.state === shipping.address?.state &&
			this.address?.city === shipping.address?.city &&
			this.address?.line1 === shipping.address?.line1 &&
			this.address?.line2 === shipping.address?.line2
	}
}
