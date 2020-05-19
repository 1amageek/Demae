import { Doc, Field } from '@1amageek/ballcap-admin'
import { Address } from '../../common/commerce/Types'
import { CountryCode } from '../../common/Country'

export default class Shipping extends Doc {

	@Field address?: Address
	@Field name?: string
	@Field phone?: string

	formatted(countryCode: CountryCode = 'US') {

		switch (countryCode) {
			case 'JP': {
				return `${
					(this.address?.postal_code || "") +
					" " +
					(this.address?.state || "") +
					" " +
					(this.address?.city || "") +
					" " +
					(this.address?.line1 || "") +
					" " +
					(this.address?.line2 || "")}`
			}
			default: {
				return `${
					(this.name || "") +
					" " +
					(this.address?.line1 || "") +
					" " +
					(this.address?.line2 || "") +
					" " +
					(this.address?.city || "") +
					" " +
					(this.address?.state || "") +
					" " +
					(this.address?.postal_code || "")}`
			}
		}
	}
}
