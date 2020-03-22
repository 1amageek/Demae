import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as ballcap from '@1amageek/ballcap-admin'
import * as path from 'path'
import next from 'next'

const firebase = admin.initializeApp()
ballcap.initialize(firebase)

// Hosting
const dev = process.env.NODE_ENV !== 'production'
const app = next({
	dev, conf: { distDir: `${path.relative(process.cwd(), __dirname)}/next` }
})
const handle = app.getRequestHandler()
export const hosting = functions.https.onRequest(async (req, res) => {
	await app.prepare()
	handle(req, res)
})

// Functions
import * as firetore from './firestore'
import * as stripe from './stripe'
export const v1 = { firetore, stripe }
