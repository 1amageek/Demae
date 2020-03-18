import React from "react"
import App from "next/app"

import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"

const config = require(`../config/${process.env.FIREBASE_CONFIG!}`)
const isEmulated = process.env.EMULATE_ENV === "emulator"

if (firebase.apps.length === 0) {
	const app = firebase.initializeApp(config)
	const firestore = app.firestore()
	if (isEmulated) {
		console.log("[APP] run emulator...")
		firestore.settings({
			host: "localhost:8080",
			ssl: false
		});
	}
	Ballcap.initialize(firestore, firestore.collection("version").doc("1"))
}

class Layout extends React.Component {
	render() {
		const { children } = this.props
		return <div className='layout'>{children}</div>
	}
}

export default class MyApp extends App {
	render() {
		const { Component, pageProps } = this.props
		return (
			<Layout>
				<Component {...pageProps} />
			</Layout>
		)
	}
}
