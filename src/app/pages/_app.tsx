import React from 'react'
import App from 'next/app'
import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { UserProvider } from 'context'

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
	Ballcap.initialize(app)
}

export default class MyApp extends App {

	static async getInitialProps({ Component, router, ctx }) {
		let pageProps = {}
		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx)
		}
		return { pageProps }
	}

	listener?: firebase.Unsubscribe

	componentDidMount() {
		this.listener = firebase.auth().onAuthStateChanged(async (auth) => {
			if (auth) {
				const authUser = JSON.stringify(auth)
				localStorage.setItem('authUser', authUser)
				this.setState({
					authUser: authUser
				})
			} else {
				localStorage.removeItem('authUser')
				this.setState({
					authUser: null
				})
			}
		})
	}

	componentWillUnmount() {
		if (this.listener) {
			this.listener()
		}
	}

	render() {
		const { Component, pageProps } = this.props
		return (
			<Provider>
				<Component {...pageProps} />
			</Provider>
		)
	}
}

const Provider = ({ children }: { children: any }) => {
	return (
		<UserProvider>
			{children}
		</UserProvider>
	)
}
