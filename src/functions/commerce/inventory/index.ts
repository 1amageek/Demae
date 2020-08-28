import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { regionFunctions } from "../../helper"
import * as Commerce from "../../models/commerce"
import { func } from "prop-types"

const MIN_AMOUNT = -100000
const MAX_AMOUNT = 100000

export const increase = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.log(data)
	const uid: string = context.auth.uid
	const { skuPath, amount } = data
	if (!skuPath) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an skuPath.")
	}
	if (!amount) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an amount.")
	}
	const intAmount = Math.floor(amount)
	if (intAmount === 0) {
		throw new functions.https.HttpsError("invalid-argument", `The amount is zero.`)
	}
	if (intAmount < MIN_AMOUNT || MAX_AMOUNT < intAmount) {
		throw new functions.https.HttpsError("invalid-argument", `The amount that can be added at a time is from ${MIN_AMOUNT} to ${MAX_AMOUNT}.`)
	}
	const skuRef = admin.firestore().doc(skuPath)
	const productID = skuRef.parent.parent!.id
	const providerRef = skuRef.parent.parent?.parent.parent
	if (!providerRef) {
		throw new functions.https.HttpsError("invalid-argument", "This skuPath is invalid.")
	}
	const roleRef = new Commerce.Provider(providerRef).operators.collectionReference.doc(uid)
	const role = await Commerce.Role.get<Commerce.Role>(roleRef)
	if (!role) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have permission to execute the process.")
	}
	if (!(role.permissions.includes("owner") || role.permissions.includes("write"))) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have permission to execute the process.")
	}
	const sku = await Commerce.SKU.get<Commerce.SKU>(skuRef)
	if (!sku) {
		throw new functions.https.HttpsError("invalid-argument", "This SKU is invalid.")
	}
	const shardCharacters = sku.shardCharacters
	if (shardCharacters.length === 0) {
		throw new functions.https.HttpsError("internal", "This SKU is invalid.")
	}
	const shardAmount = Math.floor(intAmount / shardCharacters.length)
	const remainder = intAmount % shardCharacters.length

	// const role = Commerce.Role.fromSnapshot(snapshot)
	// TODO: add permission

	const tasks = shardCharacters.map(async (shard, index) => {
		const ref = providerRef.collection("products").doc(productID)
			.collection("skus").doc(skuRef.id)
			.collection("stocks").doc(shard)
		return admin.firestore().runTransaction(async transaction => {
			const snapshot = await transaction.get(ref)
			const data = snapshot.data()
			const count: number = data ? (data["count"] || 0) : 0
			let newCount = count + shardAmount
			if (shardCharacters.length - 1 === index) {
				newCount = newCount + remainder
			}
			transaction.set(ref, { count: newCount }, { merge: true })
			return newCount
		})
	})

	await Promise.all(tasks)
})


export const update = regionFunctions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.")
	}
	functions.logger.log(data)
	const uid: string = context.auth.uid
	const { skuPath, amount } = data
	if (!skuPath) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an skuPath.")
	}
	if (!amount) {
		throw new functions.https.HttpsError("invalid-argument", "This request does not include an amount.")
	}
	const intAmount = Math.floor(amount)
	if (intAmount === 0) {
		throw new functions.https.HttpsError("invalid-argument", `The amount is zero.`)
	}
	if (intAmount < MIN_AMOUNT || MAX_AMOUNT < intAmount) {
		throw new functions.https.HttpsError("invalid-argument", `The amount that can be added at a time is from ${MIN_AMOUNT} to ${MAX_AMOUNT}.`)
	}
	const skuRef = admin.firestore().doc(skuPath)
	const productID = skuRef.parent.parent!.id
	const providerRef = skuRef.parent.parent?.parent.parent
	if (!providerRef) {
		throw new functions.https.HttpsError("invalid-argument", "This skuPath is invalid.")
	}
	const roleRef = new Commerce.Provider(providerRef).operators.collectionReference.doc(uid)
	const role = await Commerce.Role.get<Commerce.Role>(roleRef)
	if (!role) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have permission to execute the process.")
	}
	if (!(role.permissions.includes("owner") || role.permissions.includes("write"))) {
		throw new functions.https.HttpsError("invalid-argument", "You do not have permission to execute the process.")
	}
	const sku = await Commerce.SKU.get<Commerce.SKU>(skuRef)
	if (!sku) {
		throw new functions.https.HttpsError("invalid-argument", "This SKU is invalid.")
	}
	const shardCharacters = sku.shardCharacters
	if (shardCharacters.length === 0) {
		throw new functions.https.HttpsError("internal", "This SKU is invalid.")
	}
	const shardAmount = Math.floor(intAmount / shardCharacters.length)
	const remainder = intAmount % shardCharacters.length

	const tasks = shardCharacters.map(async (shard, index) => {
		const ref = providerRef.collection("products").doc(productID)
			.collection("skus").doc(skuRef.id)
			.collection("stocks").doc(shard)
		return admin.firestore().runTransaction(async transaction => {
			let newCount = shardAmount
			if (shardCharacters.length - 1 === index) {
				newCount = newCount + remainder
			}
			transaction.set(ref, { count: newCount }, { merge: true })
			return newCount
		})
	})

	await Promise.all(tasks)
})
