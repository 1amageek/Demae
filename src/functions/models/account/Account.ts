import { Doc, Field, CollectionReference, firestore } from '@1amageek/ballcap-admin'
import * as functions from 'firebase-functions'
import { BusinessType } from '../../common/commerce/account'
import { CurrencyCode } from '../../common/Currency'

export default class Account extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/accounts')
	}

	static async getAccountID(uid: string) {
		const account = await Account.get<Account>(uid)
		if (!account) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Account')
		}
		const accountID = account.accountID
		if (!accountID) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Stripe accountID')
		}
		return accountID
	}

	@Field accountID!: string
	@Field country: string = 'US'
	@Field defaultCurrency: CurrencyCode = 'USD'
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
}
