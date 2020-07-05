import React from "react"
import Router from "next/router"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import firebase from "firebase"
import * as Commerce from "models/commerce"
import { CountryCode } from "common/Country"
import { useSnackbar } from "components/Snackbar"

export default ({ redirectURL = "/", defaultCountry = "JP", onNext }: { redirectURL?: string, defaultCountry?: CountryCode, onNext?: (user: Commerce.User) => void }) => {

	const [setMessage] = useSnackbar()

	const uiConfig: firebaseui.auth.Config = {
		signInFlow: "popup",
		// signInSuccessUrl: redirectURL,
		signInOptions: [
			{
				provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				defaultCountry: defaultCountry
			}
		],
		callbacks: {
			signInSuccessWithAuthResult: (authResult) => {
				const uid = authResult.user.uid
				if (uid) {
					(async () => {
						let user = await Commerce.User.get<Commerce.User>(uid)
						if (!user) {
							user = new Commerce.User(uid)
							user.country = defaultCountry
							await user.save()
						}
						setMessage("success", `Welcome`)
						if (redirectURL) {
							Router.push(redirectURL)
						}
						if (onNext) {
							onNext(user)
						}
					})();
				}
				return false
			},
			signInFailure: async (error) => {
				console.log(error)
			}
		}
	}

	return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
}
