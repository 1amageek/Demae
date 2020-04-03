import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Path from 'path'
import os from 'os'
import fs from 'fs'
import Stripe from 'stripe'

export const image = functions.storage.object().onFinalize(async object => {
	const fileBucket = object.bucket
	const filePath = object.name
	const contentType = object.contentType
	const metageneration = object.metageneration

	if (!fileBucket || !filePath || !contentType || !metageneration) { return }

	if (!contentType.startsWith('image/')) {
		return console.log('This is not an image.');
	}
	const STRIPE_API_KEY = functions.config().stripe.api_key
	if (!STRIPE_API_KEY) {
		return console.log('The functions requires STRIPE_API_KEY.');
	}
	const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
	const fileName = Path.basename(filePath)
	const bucket = admin.storage().bucket(fileBucket);
	const tempFilePath = Path.join(os.tmpdir(), fileName);
	await bucket.file(filePath).download({ destination: tempFilePath });
	const fp = fs.readFileSync(tempFilePath);
	const file = await stripe.files.create({
		purpose: 'dispute_evidence',
		file: {
			data: fp,
			name: fileName,
			type: 'application/octet-stream',
		},
	});

})
