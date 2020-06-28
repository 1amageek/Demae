import React, { createContext, useContext } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { useDocumentListen } from '../firestore'
import User from 'models/social/User'
import { AuthContext } from '../auth'

// User
// export const SocialUserContext = createContext<[User | undefined, boolean, Error | undefined]>([undefined, true, undefined])
// export const SocialUserProvider = ({ children }: { children: any }) => {
// 	const [user, isLoading, error] = useDocumentListen<User>(User, auth?.uid ? new User(auth.uid).documentReference : undefined, waiting)
// 	return <SocialUserContext.Provider value={[user, isLoading, error]}> {children} </SocialUserContext.Provider>
// }

// export const useSocialUser = (uid: string): [User | undefined, boolean, Error | undefined] => {
// 	return useContext(SocialUserContext)
// }
