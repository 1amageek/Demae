import { Doc, Field, CollectionReference, firestore, GeoPoint } from '@1amageek/ballcap-admin'
import { Currency } from '../../common/Currency'

export default class Provider extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/accounts')
	}

	@Field name: string = ''
	@Field caption: string = ''
	@Field description: string = ''
	@Field country: string = 'US'
	@Field defaultCurrency: Currency = 'USD'
	@Field email: string = ''
	@Field location?: GeoPoint
	@Field address?: string
	@Field isAvailable: boolean = false
	@Field isRejected: boolean = false
	@Field isSigned: boolean = false
	@Field metadata?: { [key: string]: any } = {}
}
