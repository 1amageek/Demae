import React, { createContext, useContext } from 'react'
import "firebase/firestore"
import "firebase/auth"
import { Account } from 'models/account'
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
