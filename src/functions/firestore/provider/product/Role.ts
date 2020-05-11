import { regionFunctions } from '../../../helper'
import User from '../../../models/commerce/User'

const triggerdPath = '/commerce/{version}/providers/{providerID}/roles/{userID}'

export const onCreate = regionFunctions.firestore
	.document(triggerdPath)
	.onCreate(async (snapshot, context) => {
		console.info(context)
		const providerID = context.params.providerID
		const userID = context.params.providerID
		const user = new User(userID)
		const data = snapshot.data()
		if (data) {
			user.providers.collectionReference.doc(providerID).set(data)
		}
	})

export const onUpdate = regionFunctions.firestore
	.document(triggerdPath)
	.onUpdate(async (snapshot, context) => {
		console.info(context)
		const providerID = context.params.providerID
		const userID = context.params.providerID
		const user = new User(userID)
		const data = snapshot.after.data()
		if (data) {
			user.providers.collectionReference.doc(providerID).set(data)
		}
	})
