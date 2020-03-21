import { Doc, Field, Collection, SubCollection, firestore, CollectionReference } from '@1amageek/ballcap'
import { BusinessType, TosAcceptance } from 'common/commerce/Types'
import Product from './Product'

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/accounts')
	}

	@Field accountID?: string
	@Field country: string = 'JP'
	@Field businessType: BusinessType = 'individual'
	@Field company?: { [key: string]: any }
	@Field individual?: { [key: string]: any }
	@Field email!: string
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field hasLegalEntity: boolean = false
	@Field commissionRate: number = 10
	@Field balance: number = 0
	@Field accountInformation: { [key: string]: any } = {}
	@Field IPAddress?: string
	@Field metadata?: { [key: string]: any } = {}
	@Field tosAcceptance?: TosAcceptance

	@SubCollection products: Collection<Product> = new Collection()
}
