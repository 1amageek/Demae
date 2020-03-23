import React, { useEffect, useState } from 'react'
import NextApp, { AppProps, AppContext } from "next/app"
import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import * as Social from 'models/social'
import { UserProvider } from 'context'
import { useAuthUser } from 'hooks'

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

interface Props {
	authUser: string | null
}

const Provider = ({ children }: { children: any }) => {
	return (
		<UserProvider>
			{children}
		</UserProvider>
	)
}

const App = ({ Component, pageProps, router }: AppProps) => {

	const [state, setState] = useState<Props>({
		authUser: null
	})

	useEffect(() => {
		const listener = firebase.auth().onAuthStateChanged(async (auth) => {
			if (auth) {
				await signIn(auth.uid)
				const authUser = JSON.stringify(auth)
				localStorage.setItem('authUser', authUser)
				setState({
					authUser: authUser
				})
			} else {
				localStorage.removeItem('authUser')
				setState({
					authUser: null
				})
			}
		})
		return () => {
			listener()
		}
	})


	const currentAuthUser = () => {
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			return parsedUser as firebase.User
		}
		return undefined
	}

	const signIn = async (uid: string) => {
		const user = await Social.User.get<Social.User>(uid)
		if (!user) {
			const user = new Social.User(uid)
			await user.save()
		}
	}

	return (
		<Provider>
			<Component {...pageProps} />
		</Provider>
	)
}

App.getInitialProps = async (context: AppContext) => {
	const { ctx: { query, asPath, req, res }, Component } = context;
	const appProps = await NextApp.getInitialProps(context);
	return { ...appProps };
}

export default App
