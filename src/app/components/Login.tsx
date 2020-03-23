import React, { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import 'firebase/auth'

export default ({ redirectURL = '/', defaultCountry = 'JP' }: { redirectURL?: string, defaultCountry?: string }) => {

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
			// signInSuccessWithAuthResult: (authResult, redirectUrl) => {
			// 	console.log(authResult);
			// 	(authResult.user as firebase.User).getIdToken().then(idToken => {
			// 		const body = { idToken }
			// 		const headers = new Headers()
			// 		headers.append('Content-Type', 'application/json')
			// 		fetch('/admin/sessionLogin', {
			// 			method: 'POST',
			// 			body: JSON.stringify(body),
			// 			headers
			// 		}).then(response => {
			// 			console.log(response)
			// 			console.log(response.headers)
			// 		})
			// 	})
			// 	return false
			// },
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
