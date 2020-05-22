import React from 'react'
import NextApp, { AppProps, AppContext } from "next/app"
import { StaticRouter, BrowserRouter } from 'react-router-dom'
import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import { AuthProvider } from 'hooks/auth'
import { AccountProvider } from 'hooks/account'
import { UserProvider, RolesProvider, AdminProviderProvider, CartProvider, AdminProvider } from 'hooks/commerce'
import { ProcessingProvider } from 'components/Processing'
import { SnackbarProvider } from 'components/Snackbar'
import { DialogProvider } from 'components/Dialog'
import { ModalProvider } from 'components/Modal'
import { DrawerProvider } from 'components/Drawer'

const config = require(`${process.env.FIREBASE_PROJECT!}`)
const isEmulated = process.env.USE_EMULATOR === 'true'

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

const UIProvider = ({ children }: { children: any }) => {
	return (
		<ProcessingProvider>
			<SnackbarProvider>
				<DialogProvider>
					<ModalProvider>
						<DrawerProvider>
							{children}
						</DrawerProvider>
					</ModalProvider>
				</DialogProvider>
			</SnackbarProvider>
		</ProcessingProvider>
	)
}

const Provider = ({ children }: { children: any }) => {
	return (
		<AuthProvider>
			<AdminProvider>
				<AccountProvider>
					<RolesProvider>
						<AdminProviderProvider>
							<UserProvider>
								<CartProvider>
									<UIProvider>
										{children}
									</UIProvider>
								</CartProvider>
							</UserProvider>
						</AdminProviderProvider>
					</RolesProvider>
				</AccountProvider>
			</AdminProvider>
		</AuthProvider>
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
