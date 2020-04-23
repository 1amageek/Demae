import React, { useEffect, useState, createContext, useContext } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { useDocumentListen, useDataSourceListen } from '../firestore'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import Cart from 'models/commerce/Cart'
import User, { Role } from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping'

export const useAuthUser = (): [firebase.User | undefined, boolean, firebase.auth.Error?] => {
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

export const useAdmin = (): [Role | undefined, boolean, firebase.auth.Error?] => {
	interface Prop {
		data?: Role
		loading: boolean
		error?: firebase.auth.Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		let listener = firebase.auth().onIdTokenChanged(async (auth) => {
			if (auth) {
				const result = await auth?.getIdTokenResult()
				if (enabled) {
					const adminID = result.claims.admin
					if (adminID) {
						const user: User = new User(auth.uid)
						const snapshot = await user.roles.collectionReference.doc(adminID).get()
						const role: Role = Role.fromSnapshot(snapshot)
						setState({
							data: role,
							loading: false,
							error: undefined
						})
					} else {
						setState({
							data: undefined,
							loading: false,
							error: undefined
						})
					}
				}
			} else {
				if (enabled) {
					setState({
						data: undefined,
						loading: false,
						error: undefined
					})
				}
			}
		}, (error) => {
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
	const [auth, isLoading, error] = useAuthUser()
	return <AuthContext.Provider value={[auth, isLoading, error]}> {children} </AuthContext.Provider>
}

export const RoleContext = createContext<[Role | undefined, boolean, firebase.auth.Error | undefined]>([undefined, true, undefined])
export const RoleProvider = ({ children }: { children: any }) => {
	const [auth, isLoading, error] = useAdmin()
	return <RoleContext.Provider value={[auth, isLoading, error]}> {children} </RoleContext.Provider>
}

export const AdminProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [data, isLoading, error] = useDocumentListen<Provider>(Provider, auth?.uid ? new Provider(auth.uid).documentReference : undefined, waiting)
	return <AdminProviderContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderContext.Provider>
}

export const UserContext = createContext<[User | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const UserProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [user, isLoading, error] = useDocumentListen<User>(User, auth?.uid ? new User(auth.uid).documentReference : undefined, waiting)
	return <UserContext.Provider value={[user, isLoading, error]}> {children} </UserContext.Provider>
}

export const CartContext = createContext<[Cart | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const CartProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [cart, isLoading, error] = useDocumentListen<Cart>(Cart, auth?.uid ? new Cart(auth.uid).documentReference : undefined, waiting)
	return <CartContext.Provider value={[cart, isLoading, error]}> {children} </CartContext.Provider>
}

export const ProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const ProviderProvider = ({ id, children }: { id: string, children: any }) => {
	const [data, isLoading, error] = useDocumentListen<Provider>(Provider, new Provider(id).documentReference)
	return <ProviderContext.Provider value={[data, isLoading, error]}> {children} </ProviderContext.Provider>
}

export const ProviderProductContext = createContext<[Product | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const ProviderProductProvider = ({ id, children }: { id: string, children: any }) => {
	const [user, isAuthLoading] = useAuthUser()
	const documentReference = (user && id) ? new Provider(user.uid).products.collectionReference.doc(id) : undefined
	const [data, isLoading, error] = useDocumentListen<Product>(Product, documentReference, isAuthLoading)
	return <ProviderProductContext.Provider value={[data, isLoading, error]}> {children} </ProviderProductContext.Provider>
}

export const ProviderProductSKUContext = createContext<[SKU | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const ProviderProductSKUProvider = ({ id, children }: { id: string, children: any }) => {
	const [product, waiting] = useProviderProduct()
	const documentReference = (product && id) ? product.skus.collectionReference.doc(id) : undefined
	const [data, isLoading, error] = useDocumentListen<SKU>(SKU, documentReference, waiting)
	return <ProviderProductSKUContext.Provider value={[data, isLoading, error]}> {children} </ProviderProductSKUContext.Provider>
}

export const useProviderProducts = (): [Product[], boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const collectionReference = user ? new Provider(user.uid).products.collectionReference : undefined
	return useDataSourceListen<Product>(Product, { path: collectionReference?.path }, isLoading)
}

export const useProviderProductSKUs = (id?: string): [Product[], boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const collectionReference = (user && id) ? new Provider(user.uid).products.collectionReference.doc(id).collection('skus') : undefined
	return useDataSourceListen<Product>(Product, { path: collectionReference?.path }, isLoading)
}

export const useProviderProductSKU = (productID?: string, skuID?: string): [SKU | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const documentReference = (user && productID && skuID) ? new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID) : undefined
	return useDocumentListen<SKU>(SKU, documentReference, isLoading)
}

export const useAdminProvider = (): [Provider | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderContext)
}

export const useCart = (): [Cart | undefined, boolean, Error | undefined] => {
	return useContext(CartContext)
}

export const useUser = (): [User | undefined, boolean, Error | undefined] => {
	return useContext(UserContext)
}

export const useUserShipping = (id?: string): [Shipping | undefined, boolean, Error | undefined] => {
	const [auth, isAuthLoading] = useContext(AuthContext)
	const collectionReference = new User(auth?.uid).shippingAddresses.collectionReference
	const [ref] = useState(id ? collectionReference.doc(id) : collectionReference.doc())
	const [shipping, isLoading, error] = useDocumentListen<Shipping>(Shipping, ref, isAuthLoading)
	return [shipping, isLoading, error]
}

export const useUserShippingAddresses = (): [Shipping[], boolean, Error | undefined] => {
	const [auth, isAuthLoading] = useContext(AuthContext)
	const collectionReference = new User(auth?.uid).shippingAddresses.collectionReference
	const [data, isLoading, error] = useDataSourceListen<Shipping>(Shipping, { path: collectionReference?.path }, isAuthLoading)
	return [data, isLoading, error]
}

//

export const useProvider = (): [Provider | undefined, boolean, Error | undefined] => {
	return useContext(ProviderContext)
}

export const useProviderProduct = (): [Product | undefined, boolean, Error | undefined] => {
	return useContext(ProviderProductContext)
}
