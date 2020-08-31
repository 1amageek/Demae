import * as functions from "firebase-functions"
import * as path from "path"
import express from "express"
import bodyParser from "body-parser"
import next from "next"
import assets from "../assets"


const dev = process.env.NODE_ENV === "development"
const app = next({
	dev, conf: { distDir: `${path.relative(process.cwd(), __dirname)}/../next` }
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
	server.use("/assets", assets)
	server.get("*", async (req, res) => {
		await handle(req, res)
	})
	server.use((error: any) => {
		functions.logger.error(error)
		res.status(500).send("error")
	})
	server(req, res)
})
