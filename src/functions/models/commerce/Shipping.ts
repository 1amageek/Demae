import { Doc, Field } from '@1amageek/ballcap-admin'
import { Address } from '../../common/commerce/Types'
import { Country } from '../../common/Country'

export default class Shipping extends Doc {

	@Field address?: Address
	@Field firstName?: string
	@Field middleName?: string
	@Field lastName?: string
	@Field phone?: string

	formatted(country: Country = 'US') {
		return `${
			(this.firstName || "") +
			" " +
			(this.middleName || "") +
			" " +
			(this.lastName || "") +
			" " +
			(this.address?.line1 || "") +
			" " +
			(this.address?.line2 || "") +
			" " +
			(this.address?.city || "") +
			" " +
			(this.address?.state || "")}`
	}

	name() {
		if (this.middleName) {
			return `${this.firstName} ${this.middleName} ${this.lastName}`
		} else {
			return `${this.firstName} ${this.lastName}`
		}
	}
}
