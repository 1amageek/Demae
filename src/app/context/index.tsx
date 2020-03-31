import { createContext, useState, useEffect } from 'react'
import firebase from "firebase"
import User from "../models/social/User"
import { useAuthUser } from 'hooks/commerce'

export const UserContext = createContext<firebase.User | undefined>(undefined)
export const UserProvider = ({ children }) => {
	const [user] = useAuthUser()
	return <UserContext.Provider value={user}> {children} </UserContext.Provider>
}

interface AppContent {
	appBar: {
		title: string
	}
}

export const AppContext = createContext<[AppContent, (content: AppContent) => void]>([{ appBar: { title: 'Home' } }, (value: AppContent) => { }])
export const AppProvider = ({ children }) => {
	const [appContent, setAppContent] = useState<AppContent>({ appBar: { title: 'Home' } })
	return <AppContext.Provider value={[appContent, setAppContent]}> {children} </AppContext.Provider>
}
