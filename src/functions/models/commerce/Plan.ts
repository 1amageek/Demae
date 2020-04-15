import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, DocumentReference, Timestamp } from '@1amageek/ballcap-admin'
import { CurrencyCode } from '../../common/Currency'
import Subscription from './Subscription'
import { Interval, TiersMode, Tier } from '../../common/commerce/Types'

export default class Plan extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/plans')
	}

	@Field publishedBy!: string
	@Field createdBy!: string
	@Field productReference?: DocumentReference
	@Field name?: string
	@Field currency: CurrencyCode = 'USD'
	@Field amount: number = 0
	@Field interval: Interval = 'month'
	@Field intervalCount: number = 1
	@Field tiers?: Tier[]
	@Field tiersMode?: TiersMode
	@Field trialPeriodDays?: Timestamp
	@Field isAvailable: boolean = true
	@Field metadata?: any
	@SubCollection subscriptions: Collection<Subscription> = new Collection()
}
