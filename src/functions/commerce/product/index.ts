import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, getProviderID } from "../../helper"
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
	const draftRef: DocumentReference = admin.firestore().doc(productDraftPath)
	const providerRef = draftRef.parent.parent
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
	const draftSnapshot = await draftRef.get()
	if (!draftSnapshot.exists) {
		throw new functions.https.HttpsError("invalid-argument", "Invalid path.")
	}
	const batch = admin.firestore().batch()
	const productData = {
		...draftSnapshot.data()!,
		isAvailable: true
	}
	const productRef = providerRef.collection("products").doc(draftRef.id)
	const result = []
	result.push(productRef.path)
	batch.set(productRef, productData)
	batch.delete(draftRef)
	const skusSnapshot = await draftRef.collection("skus").get()
	skusSnapshot.forEach(doc => {
		const productRef = doc.ref.parent.parent!
		const skuRef = providerRef.collection("products").doc(productRef.id).collection("skus").doc(doc.ref.id)
		result.push(skuRef.path)
		batch.set(skuRef, doc.data())
		batch.delete(doc.ref)
	})
	await batch.commit()
	return { result }
})

const checkPermission = async (uid: string, providerRef: DocumentReference) => {
	const snapshot = await providerRef.collection("members").doc(uid).get()
	if (!snapshot.exists) throw new functions.https.HttpsError("invalid-argument", "You do not have permission to publish.")
	const permissions: string[] = snapshot.data()!["permissions"] ?? []
	const canWrite = permissions.includes("owner") || permissions.includes("write")
	if (!canWrite) throw new functions.https.HttpsError("invalid-argument", "You do not have permission to publish.")
}

