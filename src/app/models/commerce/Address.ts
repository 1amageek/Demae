import { Doc, Field } from '@1amageek/ballcap'
import { Address as IAddress } from 'common/commerce/Types'

export default class Address extends Doc implements IAddress {
	@Field city?: string
	@Field country?: string
	@Field line1?: string
	@Field line2?: string
	@Field postal_code?: string
	@Field state?: string
	@Field town?: string

	@Field firstName?: string
	@Field middleName?: string
	@Field lastName?: string

	formatted(country: string = 'US') {
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
			(this.town || "") +
			" " +
			(this.state || "")}`
	}
}
