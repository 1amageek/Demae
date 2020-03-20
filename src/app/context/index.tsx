import { createContext, useState, useEffect } from 'react'
import firebase from "firebase"
import User from "../models/User"
import { useCurrentUser } from 'hooks'

export const UserContext = createContext<firebase.User | undefined>(undefined)
export const UserProvider = ({ children }) => {
	const user = useCurrentUser()
	return <UserContext.Provider value={user}> {children} </UserContext.Provider>
}
