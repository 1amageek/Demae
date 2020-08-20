import React, { createContext, useContext } from 'react'
import "firebase/firestore"
import "firebase/auth"
import { Account } from 'models/account'
import { Requirement } from 'models/account'
import { AuthContext } from '../auth'
import { useDocumentListen } from 'hooks/firestore'

export const AccountContext = createContext<[Account | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AccountProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [account, isLoading, error] = useDocumentListen<Account>(Account, auth ? (new Account(auth.uid).documentReference) : undefined, waiting)
	return <AccountContext.Provider value={[account, isLoading, error]}> {children} </AccountContext.Provider>
}

export const useAccount = (): [Account | undefined, boolean, Error | undefined] => {
	return useContext(AccountContext)
}

export const RequirementContext = createContext<[Requirement | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const RequirementProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [requirement, isLoading, error] = useDocumentListen<Requirement>(Requirement, auth ? (new Requirement(auth.uid).documentReference) : undefined, waiting)
	return <RequirementContext.Provider value={[requirement, isLoading, error]}> {children} </RequirementContext.Provider>
}

export const useRequirement = (): [Requirement | undefined, boolean, Error | undefined] => {
	return useContext(RequirementContext)
}
