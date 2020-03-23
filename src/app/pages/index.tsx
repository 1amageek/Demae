import React, { useEffect } from 'react'
import Link from 'next/link'
import firebase from 'firebase'
import 'firebase/auth'
import { UserContext, UserProvider } from 'context'
import { Button } from '@material-ui/core'

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

						<Link href="/providers/create">
							<Button>Create Provider</Button>
						</Link>

					</div>
				)
			}}
		</UserContext.Consumer>
	)
}
