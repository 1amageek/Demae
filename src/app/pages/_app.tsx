import React from 'react'
import NextApp, { AppProps, AppContext } from "next/app"
import { StaticRouter, BrowserRouter } from 'react-router-dom'
import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { AuthProvider, UserProvider, CartProvider, RoleProvider } from 'hooks/commerce'
import { ProcessingProvider } from 'components/Processing'
import { SnackbarProvider } from 'components/Snackbar'

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

const Provider = ({ children }: { children: any }) => {
	return (
		<ProcessingProvider>
			<SnackbarProvider>
				<AuthProvider>
					<RoleProvider>
						<UserProvider>
							<CartProvider>
								{children}
							</CartProvider>
						</UserProvider>
					</RoleProvider>
				</AuthProvider>
			</SnackbarProvider>
		</ProcessingProvider>
	)
}

const Router = ({ location, children }: { location: string, children: any }) => {
	if (process.browser) {
		return (
			<BrowserRouter>
				{children}
			</BrowserRouter>
		)
	} else {
		return (
			<StaticRouter location={location}>
				{children}
			</StaticRouter>
		)
	}
}

const App = ({ Component, pageProps, router }: AppProps) => {
	return (
		<Provider>
			<Router location={router.asPath}>
				<Component {...pageProps} />
			</Router >
		</Provider>
	)
}

App.getInitialProps = async (context: AppContext) => {
	const appProps = await NextApp.getInitialProps(context);
	return { ...appProps };
}

export default App
