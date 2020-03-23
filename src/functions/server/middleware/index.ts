import express from 'express'
import * as admin from 'firebase-admin'

export const restrict: express.Handler = async (req, res, next) => {
	console.log(req.cookies)
	if (!req.cookies) {
		res.redirect('/login')
		return
	}
	const sessionCookie = req.cookies['__session'] || '';
	try {
		const decodedTokenId = await admin.auth().verifySessionCookie(sessionCookie, true);
		(res as any).session.decodedTokenId = decodedTokenId
		next()
	} catch (error) {
		res.redirect('/login')
	}
}
