import React from 'react'
import Router from 'next/router'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import * as Commerce from 'models/commerce'

export default ({ redirectURL = '/', defaultCountry = 'JP', onNext }: { redirectURL?: string, defaultCountry?: string, onNext?: (user: Commerce.User) => void }) => {

	const uiConfig: firebaseui.auth.Config = {
		signInFlow: 'popup',
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
							await user.save()
						}
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
