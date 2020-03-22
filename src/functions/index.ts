import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as ballcap from '@1amageek/ballcap-admin'
import * as path from 'path'
import next from 'next'
import express from 'express'
import session from 'express-session'
import FileStore from 'session-file-store'
import bodyParser from 'body-parser'

const firebase = admin.initializeApp()
ballcap.initialize(firebase)

// Hosting
const filestore = FileStore(session)
const dev = process.env.NODE_ENV !== 'production'
const app = next({
	dev, conf: { distDir: `${path.relative(process.cwd(), __dirname)}/next` }
})
const filestore_secret = functions.config().filestore.secret
const handle = app.getRequestHandler()
export const hosting = functions.https.onRequest(async (req, res) => {
	await app.prepare()
	const server = express()
	server.use(bodyParser.json())
	server.use(
		session({
			secret: filestore_secret,
			saveUninitialized: true,
			store: new filestore({ secret: filestore_secret }),
			resave: false,
			rolling: true,
			cookie: { maxAge: 604800000, httpOnly: true }, // week
		})
	)
	server.use((req, _, next) => {
		(req as any).firebaseServer = firebase
		next()
	})
	server.get('/_/signup', async (req, res) => {
		if (!req.headers.authorization) {
			throw new Error("Signup requires authentication.")
		}
		const match = req.headers.authorization.match(/^Bearer (.*)$/)
		if (match) {
			const idToken = match[1]
			const decodedToken = await firebase.auth().verifyIdToken(idToken);
			(req.session as any).decodedToken = decodedToken
			res.json({ status: true, decodedToken })
			return
		}
		throw new Error("Signup requires authentication.")
	})
	server.get('*', async (req, res) => {
		await handle(req, res)
	})
	server(req, res)
})

// Functions
import * as firetore from './firestore'
import * as stripe from './stripe'
export const v1 = { firetore, stripe }
