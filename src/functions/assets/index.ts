import express from 'express'
import * as admin from 'firebase-admin'

const app = express()

app.get('/commerce/:version/providers/:providerID/:name', async (req, res) => {
	res.set('Cache-Control', 'public, max-age=3600, s-maxage=6000')
	const bucket = admin.storage().bucket()
	const name = req.params.name
	const path = req.path.slice(1)
	const response = await bucket.file(path).download()
	if (name.includes('.jpg') || name.includes('jpeg')) {
		res.type('jpg')
	}
	if (name.includes('.png')) {
		res.type('png')
	}
	res.status(200).send(response[0])
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
