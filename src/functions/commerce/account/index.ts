import * as admin from "firebase-admin"
import { regionFunctions } from "../../helper"

const triggerdPath = "/account/{version}/accounts/{acountID}"

export const replicate = regionFunctions.firestore
	.document(triggerdPath)
	.onUpdate(async (snapshot, context) => {
		const data = snapshot.after.data()
		const purchasedBy = data.purchasedBy
		const ref = admin.firestore().doc(`/commerce/v1/providers/${purchasedBy}/orders/${snapshot.after.id}`)
		await ref.set(data, { merge: true })
	})
