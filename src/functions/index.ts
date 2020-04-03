import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as ballcap from '@1amageek/ballcap-admin'
import * as path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
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
	const server = express()
	server.use(bodyParser.json());
	server.use(bodyParser.text());
	server.use(bodyParser.urlencoded({
		extended: true
	}));
	server.get('*', async (req, res) => {
		// const idToken = getIdToken(req);
		// console.log(req.headers)
		// try {
		// 	const decodedClaims = await firebase.auth().verifyIdToken(idToken)
		// 	await handle(req, res)
		// } catch (error) {
		// 	console.log(error)
		// 	await handle(req, res)
		// }
		await handle(req, res)
	})
	server.use((error: any) => {
		console.error(error)
		res.status(500).send('error')
	})
	server(req, res)
})

// Functions
import * as firetore from './firestore'
import * as stripe from './stripe'
import * as commerce from './commerce'
export const v1 = { firetore, stripe, commerce }

