import { Doc, Field, Collection, SubCollection, firestore, CollectionReference } from '@1amageek/ballcap'
import { BusinessType, TosAcceptance } from 'common/commerce/account'
import Product from './Product'
import { Currency } from 'common/Currency'

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/accounts')
	}

	@Field accountID!: string
	@Field country: string = 'US'
	@Field defaultCurrency: Currency = 'USD'
	@Field businessType: BusinessType = 'individual'
	@Field company?: { [key: string]: any }
	@Field individual?: { [key: string]: any }
	@Field email!: string
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field hasLegalEntity: boolean = false
	@Field commissionRate: number = 10
	@Field balance: number = 0
	@Field metadata?: { [key: string]: any } = {}

	@SubCollection products: Collection<Product> = new Collection()
}
