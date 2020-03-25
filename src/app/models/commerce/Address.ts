import { Doc, Field } from '@1amageek/ballcap'
import { Address as IAddress } from 'common/commerce/Types'
import { Country } from 'common/Country'

export default class Address extends Doc implements IAddress {
	@Field city?: string
	@Field country?: Country
	@Field line1?: string
	@Field line2?: string
	@Field postal_code?: string
	@Field state?: string

	@Field firstName?: string
	@Field middleName?: string
	@Field lastName?: string

	formatted(country: Country = 'US') {
		return `${
			(this.firstName || "") +
			" " +
			(this.middleName || "") +
			" " +
			(this.lastName || "") +
			" " +
			(this.line1 || "") +
			" " +
			(this.line2 || "") +
			" " +
			(this.city || "") +
			" " +
			(this.state || "")}`
	}

	name() {
		if (this.middleName) {
			return `${this.firstName} ${this.middleName} ${this.lastName}`
		} else {
			return `${this.firstName} ${this.lastName}`
		}
	}

	address() {
		const { city, country, line1, line2, postal_code, state } = this.data()
		return { city, country, line1, line2, postal_code, state }
	}
}
