import React, { useEffect, useState, createContext, useContext } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"

const _useAuthUser = (): [firebase.User | undefined, boolean, firebase.auth.Error?] => {
	interface Prop {
		data?: firebase.User
		loading: boolean
		error?: firebase.auth.Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		let listener = firebase.auth().onAuthStateChanged(auth => {
			if (enabled) {
				setState({
					data: auth as firebase.User,
					loading: false,
					error: undefined
				})
			}
		}, error => {
			if (enabled) {
				setState({
					data: undefined,
					loading: false,
					error: error
				})
			}
		})
		return () => {
			enabled = false
			listener()
		}
	}, []);
	return [state.data, state.loading, state.error]
}

export const AuthContext = createContext<[firebase.User | undefined, boolean, firebase.auth.Error | undefined]>([undefined, true, undefined])
export const AuthProvider = ({ children }: { children: any }) => {
	const [auth, isLoading, error] = _useAuthUser()
	return <AuthContext.Provider value={[auth, isLoading, error]}> {children} </AuthContext.Provider>
}

export const useAuthUser = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] => {
	return useContext(AuthContext)
}
