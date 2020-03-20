import { useEffect, useState } from 'react'

import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"


export const useAuthUser = () => {
	const [authUser, setAuthUser] = useState<firebase.User | undefined>(undefined)
	useEffect(() => {
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			if (authUser?.uid !== parsedUser.uid) {
				setAuthUser(parsedUser as firebase.User)
			}
		} else {
			setAuthUser(undefined)
		}
	})
	return authUser
}
