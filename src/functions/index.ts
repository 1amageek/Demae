import * as admin from "firebase-admin"
import * as ballcap from "@1amageek/ballcap-admin"

const firebase = admin.initializeApp()
ballcap.initialize(firebase)

import * as firestore from "./firestore"
import * as stripe from "./stripe"
import * as account from "./account"
import * as commerce from "./commerce"

let hosting = {}
const isEmulator = process.env.FUNCTIONS_EMULATOR ?? false
if (!isEmulator) {
	hosting = require("./web").hosting
}

export { hosting, firestore, stripe, account, commerce }

