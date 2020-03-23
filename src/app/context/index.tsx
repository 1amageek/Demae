import { createContext, useState, useEffect } from 'react'
import firebase from "firebase"
import User from "../models/social/User"
import { useAuthUser } from 'hooks'

export const UserContext = createContext<firebase.User | undefined>(undefined)
export const UserProvider = ({ children }) => {
	const [user] = useAuthUser()
	return <UserContext.Provider value={user}> {children} </UserContext.Provider>
}
