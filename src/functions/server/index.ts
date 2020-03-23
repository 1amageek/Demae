import express from 'express'
import * as admin from 'firebase-admin'
import { restrict } from './middleware'

const server = express()

server.post('/sessionLogin', async (req, res) => {
	console.log(req.body)
	const idToken = req.body.idToken
	// const csrfToken = req.body.csrfToken
	// if (csrfToken !== req.cookies.csrfToken) {
	// 	res.status(401).send('UNAUTHORIZED REQUEST!');
	// 	return;
	// }
	const expiresIn = 60 * 60 * 24 * 5 * 1000;
	try {
		const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })
		const options = { maxAge: expiresIn, httpOnly: true, secure: true };
		res.cookie('__session', sessionCookie, options);
		res.end(JSON.stringify({ status: 'success' }));
	} catch (error) {
		res.status(401).send('UNAUTHORIZED REQUEST!');
	}
})

server.get('*', restrict)

export default server
