import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, DocumentReference, Timestamp } from '@1amageek/ballcap-admin'
import { Currency } from '../../util/Currency'
import Subscription from './Subscription'

export default class Plan extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/plans')
	}

	@Field publishedBy!: string
	@Field createdBy!: string
	@Field productReference?: DocumentReference
	@Field name?: string
	@Field currency: Currency = 'JPY'
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

export type Interval = 'day' | 'week' | 'month' | 'year'

export type TiersMode = 'graduated' | 'volume'

export type Tier = {
	upTo: number;
	flatAmount?: number;
	unitAmount?: number;
};
