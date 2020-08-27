import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, getProviderID } from "../../helper"
import { checkPermission } from "../helper"
import { DocumentReference } from "@1amageek/ballcap-admin"

export const publish = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.info(data)
	const uid: string = context.auth.uid
	const productDraftPath = data.productDraftPath
	if (!productDraftPath) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an productDraftPath.")
	}
	const productDraftRef: DocumentReference = admin.firestore().doc(productDraftPath)
	const providerRef = productDraftRef.parent.parent
	if (!providerRef) {
		throw new functions.https.HttpsError("invalid-argument", "Invalid path.")
	}
	const providerID = await getProviderID(uid)
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a providerID.")
	}
	if (providerRef.id !== providerID) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have permission to publish.")
	}
	await checkPermission(uid, providerRef)
	const draftSnapshot = await productDraftRef.get()
	if (!draftSnapshot.exists) {
		throw new functions.https.HttpsError("invalid-argument", "Invalid path.")
	}
	const productRef = providerRef.collection("products").doc(productDraftRef.id)
	const batch = admin.firestore().batch()
	const productData = {
		...draftSnapshot.data()!,
		accessControl: "public"
	}

	const result = []
	result.push(productRef.path)
	batch.set(productRef, productData)
	batch.set(productDraftRef, productData)

	const [skusSnapshot, draftSKUsSnapshot] = await Promise.all([productRef.collection("skus").get(), productDraftRef.collection("skus").get()])
	if (skusSnapshot.empty && draftSKUsSnapshot.empty) {
		return {
			error: {
				message: "The product could not be published because the product does not have an SKU."
			}
		}
	}
	draftSKUsSnapshot.forEach(doc => {
		const skuRef = productRef.collection("skus").doc(doc.ref.id)
		result.push(skuRef.path)
		batch.set(skuRef, doc.data())
	})
	await batch.commit()
	return { result }
})
