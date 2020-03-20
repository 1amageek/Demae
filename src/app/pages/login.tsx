import React, { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import 'firebase/auth'
import { useCurrentUser } from 'hooks'

export default ({ redirectURL = '/', defaultCountry = 'JP' }: { redirectURL: string, defaultCountry: string }) => {

	const uiConfig: firebaseui.auth.Config = {
		signInFlow: 'popup',
		signInSuccessUrl: redirectURL,
		signInOptions: [
			{
				provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				defaultCountry: defaultCountry
			}
		],
		callbacks: {
			signInSuccessWithAuthResult: (authResult, redirectUrl) => {
				console.log(authResult, redirectUrl)
				return true
			},
			signInFailure: async (error) => {
				console.log(error)
			}
		}
	}

	return (
		<div>
			<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
		</div>
	)
}
