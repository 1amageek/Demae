import * as functions from "firebase-functions"
import { DocumentReference } from "@1amageek/ballcap-admin"

export const checkPermission = async (uid: string, providerRef: DocumentReference) => {
	const snapshot = await providerRef.collection("members").doc(uid).get()
	if (!snapshot.exists) throw new functions.https.HttpsError("invalid-argument", "You do not have permission to publish.")
	const permissions: string[] = snapshot.data()!["permissions"] ?? []
	const canWrite = permissions.includes("owner") || permissions.includes("write")
	if (!canWrite) throw new functions.https.HttpsError("invalid-argument", "You do not have permission to publish.")
}

