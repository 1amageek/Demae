import { createContext, useState, useEffect } from 'react'
import firebase from "firebase"
import User from "../models/User"

export const UserContext = createContext<{ user?: User, setUser: (user?: User) => void }>({ user: undefined, setUser: (user?: User) => { } })
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState<User | undefined>(undefined)
	const [processing, setProcessing] = useState(true)
	useEffect(() => {
		setProcessing(true)
		const unsubscriber = firebase.auth().onAuthStateChanged(async (auth) => {
			if (auth) {
				const user = await new User(auth.uid).fetch()
				if (user.snapshot && user.snapshot.exists) {
					setUser(user)
				} else {
					await user.save()
					setUser(user)
				}
			}
			setProcessing(false)
		})
		return () => {
			unsubscriber()
		}
	}, [])
	if (processing) {
		return <>loading..</>
	} else {
		return <UserContext.Provider value={{ user, setUser }}> {children} </UserContext.Provider>
	}
}