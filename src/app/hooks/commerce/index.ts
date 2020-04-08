import { useEffect, useState } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { Doc, DocumentReference } from '@1amageek/ballcap'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import Cart from 'models/commerce/Cart'
import User from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping'

export const useAuthUser = (): [firebase.User | undefined, boolean, Error?] => {
	interface Prop {
		data?: firebase.User
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			if (state.data?.uid !== parsedUser.uid) {
				if (enabled) {
					setState({
						data: parsedUser as firebase.User,
						loading: false
					})
				}
			} else {
				if (enabled) {
					setState({
						loading: false
					})
				}
			}
		} else {
			setState({
				loading: false
			})
		}
		return () => {
			enabled = false
		}
	}, []);
	return [state.data, state.loading, state.error]
}

export const useAdmin = (): [string | undefined, boolean, Error?] => {
	interface Prop {
		data?: string
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const claims = localStorage.getItem('claims')
		if (claims) {
			const parsedClaims = JSON.parse(claims)
			if (state.data !== parsedClaims.admin) {
				if (enabled) {
					setState({
						data: parsedClaims.admin,
						loading: false
					})
				}
			} else {
				if (enabled) {
					setState({
						loading: false
					})
				}
			}
		} else {
			setState({
				loading: false
			})
		}
		return () => {
			enabled = false
		}
	}, []);
	return [state.data, state.loading, state.error]
}

export const useProvider = (): [Provider | undefined, boolean, Error?] => {
	const [adminID, isAdminLoading] = useAdmin()
	interface Prop {
		data?: Provider
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const fetchData = async (adminID: string) => {
			try {
				const data = await Provider.get<Provider>(adminID)
				if (enabled) {
					setState({
						...state,
						loading: false,
						data
					})
				}
			} catch (error) {
				if (enabled) {
					setState({
						...state,
						loading: false,
						error
					})
				}
			}
		}
		if (adminID) {
			fetchData(adminID)
		} else {
			setState({
				...state,
				loading: isAdminLoading
			})
		}
		return () => {
			enabled = false
		}
	}, [adminID, isAdminLoading])
	return [state.data, state.loading, state.error]
}

export const useProviderProduct = (id: string): [Product | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	if (user) {
		return useDocument(Product, new Provider(user.uid).products.collectionReference.doc(id))
	} else {
		return [undefined, isLoading]
	}
}

export const useProviderProductSKU = (productID: string, skuID: string): [SKU | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	if (user) {
		return useDocument(SKU, new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID))
	} else {
		return [undefined, isLoading]
	}
}

export const useDocument = <T extends Doc>(type: typeof Doc, documentReference: DocumentReference): [T | undefined, boolean, Error?] => {
	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const fetchData = async (documentReference: DocumentReference) => {
			try {
				const snapshot = await documentReference.get()
				const data = type.fromSnapshot<T>(snapshot)
				if (enabled) {
					setState({
						...state,
						loading: false,
						data
					})
				}
			} catch (error) {
				if (enabled) {
					setState({
						...state,
						loading: false,
						error
					})
				}
			}
		}
		fetchData(documentReference)
		return () => {
			enabled = false
		}
	}, [documentReference.path])
	return [state.data, state.loading, state.error]
}

export const useDataSource = <T extends Doc>(type: typeof Doc, query: firebase.firestore.Query, waiting: boolean = false): [T[], boolean, Error | undefined] => {

	interface Prop {
		data: T[]
		loading: boolean
		error?: Error
	}

	const [state, setState] = useState<Prop>({ data: [], loading: true })
	useEffect(() => {
		if (waiting) {
			return
		}
		let enabled = true
		const fetchData = async () => {
			try {
				const snapshot = await query.get()
				const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
				if (enabled) {
					setState({
						...state,
						loading: false,
						data
					});
				}
			} catch (error) {
				if (enabled) {
					setState({
						...state,
						loading: false,
						error
					});
				}
			}
		};
		setState({
			...state,
			loading: true
		})
		fetchData();
		return () => {
			enabled = false
		}
	}, [waiting])
	return [state.data, state.loading, state.error]
};


export const useCart = (): [Cart | undefined, boolean] => {
	const [user] = useAuthUser()
	const [cart, setCart] = useState<Cart | undefined>(undefined)
	const [isLoading, setLoading] = useState(false)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!cart) {
					setLoading(true)
					const cart = await Cart.get<Cart>(user.uid) || new Cart(user.uid)
					setCart(cart)
					setLoading(false)
				}
			}
		})()
	}, [user?.uid, cart?.id])
	return [cart, isLoading]
}

export const useUser = (): [User | undefined, boolean] => {
	const [auth] = useAuthUser()
	const [user, setUser] = useState<User | undefined>(undefined)
	const [isLoading, setLoading] = useState(false)
	useEffect(() => {
		(async () => {
			if (auth) {
				if (!user) {
					setLoading(true)
					const user = await User.get<User>(auth.uid) || new User(auth.uid)
					setUser(user)
					setLoading(false)
				}
			}
		})()
	}, [auth?.uid, user?.id])
	return [user, isLoading]
}

export const useUserShipping = (id: string): [Shipping | undefined, boolean] => {
	const [auth] = useAuthUser()
	const [shipping, setShipping] = useState<Shipping | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (auth) {
				if (!shipping) {
					const snapshot = await new User(auth.uid).shippingAddresses.collectionReference.doc(id).get()
					let shipping = Shipping.fromSnapshot<Shipping>(snapshot)
					setShipping(shipping)
					setLoading(false)
				}
			}
		})()
	}, [auth?.uid, shipping?.id])
	return [shipping, isLoading]
}

