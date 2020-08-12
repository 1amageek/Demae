import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, getProviderID } from "../../helper"
import { checkPermission } from "../helper"
import { DocumentReference } from "@1amageek/ballcap-admin"
import Provider, { ProviderDraft } from "../../models/commerce/Provider"

export const publish = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.info(data)
	const uid: string = context.auth.uid
	const providerID = await getProviderID(uid)
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a providerID.")
	}
	const providerDraftRef: DocumentReference = new Provider(providerID).documentReference
	const providerRef: DocumentReference = new Provider(providerID).documentReference
	await checkPermission(uid, providerRef)

	const snapshot = await providerRef.collection("products").get()
	if (snapshot.empty) {
		return {
			error: {
				message: "Providers cannot publish their providers because the product is not ready."
			}
		}
	}

	const draftSnapshot = await providerDraftRef.get()
	if (!draftSnapshot.exists) {
		throw new functions.https.HttpsError("invalid-argument", "Invalid path.")
	}
	const batch = admin.firestore().batch()
	const providerData = {
		...draftSnapshot.data()!,
		isAvailable: true
	}
	batch.set(providerRef, providerData)
	await batch.commit()
	const provider = new Provider(providerID)
	provider.setData(draftSnapshot.data()!)
	return {
		result: provider.data({ convertDocumentReference: true })
	}
})

export const close = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.info(data)
	const uid: string = context.auth.uid
	const providerID = await getProviderID(uid)
	if (!providerID) {
		throw new functions.https.HttpsError("invalid-argument", "Auth does not maintain a providerID.")
	}
	const providerRef = new Provider(providerID).documentReference
	await checkPermission(uid, providerRef)
	await providerRef.delete()
	return {}
})
