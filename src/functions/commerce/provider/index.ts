import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions, getProviderID } from "../../helper"
import { checkPermission } from "../helper"
import { DocumentReference, Batch } from "@1amageek/ballcap-admin"
import Account from "../../models/account/Account"
import Provider, { ProviderDraft, Role } from "../../models/commerce/Provider"

import * as operator from "./operators"
export { operator }

export const create = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.info(data)
	const uid: string = context.auth.uid
	const provider = new ProviderDraft(uid)
	const { name, country, defaultCurrency, capabilities } = data
	provider.name = name
	provider.country = country
	provider.defaultCurrency = defaultCurrency
	provider.capabilities = capabilities
	const provierRole = new Role(new Provider(uid).operators.collectionReference.doc(uid))
	try {
		const batch = new Batch()
		batch.save(provider)
		batch.save(provierRole)
		await batch.commit()
	} catch (error) {
		functions.logger.error(error)
	}
	return {
		result: provider.data()
	}
})

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
	const providerDraftRef: DocumentReference = new ProviderDraft(providerID).documentReference
	const providerRef: DocumentReference = new Provider(providerID).documentReference
	await checkPermission(uid, providerRef)

	const account = await Account.get<Account>(providerID)
	if (!account) {
		throw new functions.https.HttpsError("invalid-argument", "The Requirement could not be verified.")
	}
	const currentlyDue = account.stripe?.individual?.requirements?.currently_due ?? []
	if (currentlyDue.length) {
		return {
			error: {
				message: "Please enter the required items."
			}
		}
	}

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

export const requirements = regionFunctions.https.onCall(async (data, context) => {
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
	const account = await Account.get<Account>(providerID)
	if (!account) {
		throw new functions.https.HttpsError("invalid-argument", "The Requirement could not be verified.")
	}
	const requirements = account.stripe?.requirements || []
	return {
		result: requirements
	}
})
