import express from 'express'
import * as admin from 'firebase-admin'
import sharp from "sharp";

const app = express()

const MAX_WIDTH = 1080
const MAX_HEIGHT = 1080

interface Size {
	width: number
	height: number
}

const parseSize = (size: string): Size => {
	let width, height;
	if (size.indexOf(",") !== -1) {
		[width, height] = size.split(",");
	} else if (size.indexOf("x") !== -1) {
		[width, height] = size.split("x");
	} else {
		throw new Error("height and width are not delimited by a ',' or a 'x'");
	}
	width = parseInt(width, 10) || MAX_WIDTH
	height = parseInt(height, 10) || MAX_HEIGHT
	width = Math.min(width, MAX_WIDTH)
	height = Math.min(height, MAX_HEIGHT)
	return { width, height }
}

app.get('/w/:width/*', async (req, res, next) => {
	res.set('Cache-Control', 'public, max-age=3600, s-maxage=36000')
	const { width } = req.params
	let sizeWidth = parseInt(width, 10) || MAX_WIDTH
	let sizeHeight = parseInt(width, 10) || MAX_WIDTH

	sizeWidth = Math.min(sizeWidth, MAX_WIDTH)
	sizeHeight = Math.min(sizeHeight, MAX_WIDTH)

	const targetSize = {
		width: sizeWidth,
		height: sizeHeight
	}
	const path = req.params[0]
	if (path.includes('.jpg') || path.includes('.jpeg') || path.includes('.png')) {
		const bucket = admin.storage().bucket()
		try {
			const response = await bucket.file(path).download()
			const originalImage = response[0]
			if (path.includes('.jpg') || path.includes('.jpeg')) res.type('jpg')
			if (path.includes('.png')) res.type('png')
			const resizedImage = await sharp(originalImage)
				.resize(targetSize.width, targetSize.height)
				.toBuffer()
			res.status(200).send(resizedImage)
		} catch (error) {
			next(error)
		}
	}
})

app.get('/s/:size/*', async (req, res, next) => {
	res.set('Cache-Control', 'public, max-age=3600, s-maxage=36000')
	const { size } = req.params
	const targetSize = parseSize(size)
	const path = req.params[0]
	if (path.includes('.jpg') || path.includes('.jpeg') || path.includes('.png')) {
		const bucket = admin.storage().bucket()
		try {
			const response = await bucket.file(path).download()
			const originalImage = response[0]
			if (path.includes('.jpg') || path.includes('.jpeg')) res.type('jpg')
			if (path.includes('.png')) res.type('png')
			const resizedImage = await sharp(originalImage)
				.resize(targetSize.width, targetSize.height)
				.toBuffer()
			res.status(200).send(resizedImage)
		} catch (error) {
			next(error)
		}
	}
})

app.get('*', async (req, res, next) => {
	res.set('Cache-Control', 'public, max-age=3600, s-maxage=36000')
	const path = req.path.slice(1)
	if (path.includes('.jpg') || path.includes('.jpeg') || path.includes('.png')) {
		const bucket = admin.storage().bucket()
		try {
			const response = await bucket.file(path).download()
			if (path.includes('.jpg') || path.includes('.jpeg')) res.type('jpg')
			if (path.includes('.png')) res.type('png')
			res.status(200).send(response[0])
		} catch (error) {
			next(error)
		}
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
