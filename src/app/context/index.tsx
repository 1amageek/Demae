import { createContext, useState, useEffect } from 'react'
import firebase from "firebase"
import User from "../models/commerce/User"
import { useAuthUser, useUser } from 'hooks/commerce'

export const AuthContext = createContext<firebase.User | undefined>(undefined)
export const AuthProvider = ({ children }) => {
	const [user] = useAuthUser()
	return <AuthContext.Provider value={user}> {children} </AuthContext.Provider>
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

export const UserContext = createContext<[User | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const UserProvider = ({ children }: { children: any }) => {
	const [user, isLoading, error] = useUser()
	return <UserContext.Provider value={[user, isLoading, error]}>{children}</UserContext.Provider>
}
