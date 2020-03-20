import { useEffect, useState } from 'react'

import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"


export const useCurrentUser = () => {
	const [currentUser, setCurrentUser] = useState<firebase.User | undefined>(undefined)
	useEffect(() => {
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			if (currentUser?.uid !== parsedUser.uid) {
				setCurrentUser(parsedUser as firebase.User)
			}
		} else {
			setCurrentUser(undefined)
		}
	})
	return currentUser
}
