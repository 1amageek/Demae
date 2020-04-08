import express from 'express'
import * as admin from 'firebase-admin'

const app = express()

app.get('*', async (req, res, next) => {
	res.set('Cache-Control', 'public, max-age=3600, s-maxage=6000')
	const bucket = admin.storage().bucket()
	const path = req.path.slice(1)
	try {
		const response = await bucket.file(path).download()
		if (path.includes('.jpg') || path.includes('jpeg')) res.type('jpg')
		if (path.includes('.png')) res.type('png')
		res.status(200).send(response[0])
	} catch (error) {
		next(error)
	}
})

app.use((req, res, next) => {
	const err = new Error('Not Found')
	next(err)
})

// error handler
app.use((req, res, next) => {
	res.status(400).send('Bad Request')
})

export default app
