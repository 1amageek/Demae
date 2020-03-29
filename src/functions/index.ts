import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as ballcap from '@1amageek/ballcap-admin'
import * as path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import next from 'next'
import { getIdToken } from './helper'

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
	server.use(bodyParser.json())
	server.use(bodyParser.text())
	server.get('/admin', async (req, res) => {
		const idToken = getIdToken(req)
		try {
			const decodedClaims = await admin.auth().verifyIdToken(idToken)
			if (decodedClaims) {
				console.log(decodedClaims.uid)
			}
			await handle(req, res)
		} catch (error) {
			next(error)
		}
	})
	server.get('*', async (req, res) => {
		await handle(req, res)
	})
	server(req, res)
})

// Functions
import * as firetore from './firestore'
import * as stripe from './stripe'
import * as commerce from './commerce'
export const v1 = { firetore, stripe, commerce }
