import React, { useEffect, useState, createContext, useContext } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { useDocumentListen, useDataSourceListen } from '../firestore'
import Provider, { ProviderDraft, Role } from 'models/commerce/Provider'
import Product, { ProductDraft } from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import Cart from 'models/commerce/Cart'
import User from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping'
import Order from 'models/commerce/Order'
import { AuthContext } from '../auth'

const _useAdmin = (): [Role | undefined, boolean, firebase.auth.Error?] => {
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
						const snapshot = await user.providers.collectionReference.doc(adminID).get()
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

export const AdminContext = createContext<[Role | undefined, boolean, firebase.auth.Error | undefined]>([undefined, true, undefined])
export const AdminProvider = ({ children }: { children: any }) => {
	const [auth, isLoading, error] = _useAdmin()
	if (error) console.error(error)
	return <AdminContext.Provider value={[auth, isLoading, error]}> {children} </AdminContext.Provider>
}

export const useAdmin = (): [Role | undefined, boolean, firebase.auth.Error | undefined] => {
	return useContext(AdminContext)
}

export const useProviderBlank = (): [Provider | undefined, boolean, firebase.auth.Error | undefined] => {
	const [admin, waiting, error] = useAdmin()
	const provider = admin !== undefined ? new Provider(admin.id) : undefined
	return [provider, waiting, error]
}

// Admin
export const AdminProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useAdmin()
	const [data, isLoading, error] = useDocumentListen<Provider>(Provider, auth?.id ? new Provider(auth.id).documentReference : undefined, waiting)
	return <AdminProviderContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderContext.Provider>
}

export const AdminProviderDraftContext = createContext<[ProviderDraft | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderDraftProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useAdmin()
	const [data, isLoading, error] = useDocumentListen<ProviderDraft>(ProviderDraft, auth?.id ? new ProviderDraft(auth.id).documentReference : undefined, waiting)
	return <AdminProviderDraftContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderDraftContext.Provider>
}

export const AdminProviderProductContext = createContext<[Product | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderProductProvider = ({ id, children }: { id: string, children: any }) => {
	const [provider, waiting] = useProviderBlank()
	const documentReference = (provider && id) ? provider?.products.collectionReference.doc(id) : undefined
	const [data, isLoading, error] = useDocumentListen<Product>(Product, documentReference, waiting)
	return <AdminProviderProductContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderProductContext.Provider>
}

export const AdminProviderProductDraftContext = createContext<[ProductDraft | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderProductDraftProvider = ({ id, children }: { id: string, children: any }) => {
	const [provider, waiting] = useProviderBlank()
	const documentReference = (provider && id) ? provider?.productDrafts.collectionReference.doc(id) : undefined
	const [data, isLoading, error] = useDocumentListen<ProductDraft>(ProductDraft, documentReference, waiting)
	return <AdminProviderProductDraftContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderProductDraftContext.Provider>
}

export const AdminProviderOrderContext = createContext<[Order | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderOrderProvider = ({ id, children }: { id?: string, children: any }) => {
	const [provider, waiting] = useProviderBlank()
	const documentReference = (provider && id) ? provider.orders.collectionReference.doc(id) : undefined
	const [data, isLoading, error] = useDocumentListen<Order>(Order, documentReference, waiting)
	return <AdminProviderOrderContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderOrderContext.Provider>
}

export const useAdminProvider = (): [Provider | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderContext)
}

export const useAdminProviderDraft = (): [ProviderDraft | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderDraftContext)
}

export const useAdminProviderProducts = (): [Product[], boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const collectionReference = provider ? provider.products.collectionReference : undefined
	return useDataSourceListen<Product>(Product, { path: collectionReference?.path }, waiting)
}

export const useAdminProviderProduct = (): [Product | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderProductContext)
}

export const useAdminProviderProductSKUs = (id?: string): [SKU[], boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const collectionReference = (provider && id) ? provider.products.collectionReference.doc(id).collection('skus') : undefined
	return useDataSourceListen<SKU>(SKU, { path: collectionReference?.path }, waiting)
}

export const useAdminProviderProductDraft = (): [ProductDraft | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderProductDraftContext)
}

export const useAdminProviderProductDraftSKUs = (id?: string): [SKU[], boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const collectionReference = (provider && id) ? provider.productDrafts.collectionReference.doc(id).collection('skus') : undefined
	return useDataSourceListen<SKU>(SKU, { path: collectionReference?.path }, waiting)
}

export const useAdminProviderOrders = (): [Order[], boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const collectionReference = provider ? provider.orders.collectionReference : undefined
	return useDataSourceListen<Order>(Order, { path: collectionReference?.path }, waiting)
}

export const useAdminProviderProductSKU = (productID?: string, skuID?: string): [SKU | undefined, boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const documentReference = (provider && productID && skuID) ? provider.products.doc(productID, Product).skus.collectionReference.doc(skuID) : undefined
	return useDocumentListen<SKU>(SKU, documentReference, waiting)
}

export const useAdminProviderOrder = (id?: string): [Order | undefined, boolean, Error?] => {
	const [provider, waiting] = useAdminProvider()
	const documentReference = (provider && id) ? provider.orders.collectionReference.doc(id) : undefined
	return useDocumentListen<Order>(Order, documentReference, waiting)
}


// User
export const UserContext = createContext<[User | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const UserProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [user, isLoading, error] = useDocumentListen<User>(User, auth?.uid ? new User(auth.uid).documentReference : undefined, waiting)
	return <UserContext.Provider value={[user, isLoading, error]}> {children} </UserContext.Provider>
}

export const RolesContext = createContext<[Role[], boolean, Error | undefined]>([[], true, undefined])
export const RolesProvider = ({ children }: { children: any }) => {
	const [user, waiting] = useContext(UserContext)
	const [roles, isLoading, error] = useDataSourceListen<Role>(Role, user ? {
		path: user.providers.collectionReference.path
	} : undefined, waiting)
	return <RolesContext.Provider value={[roles, isLoading, error]}> {children} </RolesContext.Provider>
}

export const CartContext = createContext<[Cart | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const CartProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [cart, isLoading, error] = useDocumentListen<Cart>(Cart, auth?.uid ? new Cart(auth.uid).documentReference : undefined, waiting)
	return <CartContext.Provider value={[cart, isLoading, error]}> {children} </CartContext.Provider>
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

export const useCart = (): [Cart | undefined, boolean, Error | undefined] => {
	return useContext(CartContext)
}

export const useUser = (): [User | undefined, boolean, Error | undefined] => {
	return useContext(UserContext)
}

export const useRoles = (): [Role[], boolean, Error | undefined] => {
	return useContext(RolesContext)
}

// Provider

// export const ProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
// export const ProviderProvider = ({ id, children }: { id?: string, children: any }) => {
// 	const [provider, isLoading, error] = useDocumentListen<Provider>(Provider, id ? new Provider(id).documentReference : undefined)
// 	return <ProviderContext.Provider value={[provider, isLoading, error]}> {children} </ProviderContext.Provider>
// }

// export const ProviderProductContext = createContext<[Product | undefined, boolean, Error | undefined]>([undefined, true, undefined])
// export const ProviderProductProvider = ({ id, children }: { id?: string, children: any }) => {
// 	const [provider, waiting] = useContext(ProviderContext)
// 	const [product, isLoading, error] = useDocumentListen<Product>(Product, id ? provider?.products.collectionReference.doc(id) : undefined, waiting)
// 	return <ProviderProductContext.Provider value={[product, isLoading, error]}> {children} </ProviderProductContext.Provider>
// }

// export const useProvider = (): [Provider | undefined, boolean, Error | undefined] => {
// 	return useContext(ProviderContext)
// }

// export const useProviderProduct = (): [Product | undefined, boolean, Error | undefined] => {
// 	return useContext(ProviderProductContext)
// }
