import * as functions from 'firebase-functions'
import * as path from 'path'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'

const app = next({
	dev,
	conf: { distDir: `${path.relative(process.cwd(), __dirname)}/next` }
})

const handle = app.getRequestHandler()
export const hosting = functions.https.onRequest((req, res) => {
	return app.prepare().then(() => handle(req, res))
})