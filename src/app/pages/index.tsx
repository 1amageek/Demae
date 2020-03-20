import React, { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import 'firebase/auth'
import { useAuthUser } from 'hooks'
import { UserContext, UserProvider } from 'context'

export default () => {

	return (
		<UserContext.Consumer>
			{user => {
				return (
					<div>
						{user && "a"}
						<button onClick={async () => {
							await firebase.auth().signOut()
						}}>logout</button>
					</div>
				)
			}}
		</UserContext.Consumer>
	)
}
