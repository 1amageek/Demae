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
	const documentReference = user ? new Provider(user.uid).products.collectionReference.doc(id) : undefined
	return useDocument<Product>(Product, documentReference, isLoading)
}

export const useProviderProductSKU = (productID: string, skuID: string): [SKU | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const documentReference = user ? new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID) : undefined
	return useDocument<SKU>(SKU, documentReference, isLoading)
}

export const useDocument = <T extends Doc>(type: typeof Doc, documentReference?: DocumentReference, waiting: boolean = false): [T | undefined, boolean, Error?] => {
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
		if (!waiting && documentReference) {
			fetchData(documentReference)
		}
		return () => {
			enabled = false
		}
	}, [documentReference?.path, waiting])
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
		if (!waiting) {
			fetchData()
		}
		return () => {
			enabled = false
		}
	}, [waiting])
	return [state.data, state.loading, state.error]
};

export const useDocumentListen = <T extends Doc>(type: typeof Doc, documentReference?: DocumentReference, waiting: boolean = false): [T | undefined, boolean, Error?] => {
	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const listen = async (documentReference: DocumentReference) => {
			documentReference.onSnapshot({
				next: (snapshot) => {
					const data = type.fromSnapshot<T>(snapshot)
					if (enabled) {
						setState({
							...state,
							loading: false,
							data
						})
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							...state,
							loading: false,
							error
						})
					}
				}
			})
		}
		if (!waiting && documentReference) {
			listen(documentReference)
		}
		return () => {
			enabled = false
		}
	}, [documentReference?.path, waiting])
	return [state.data, state.loading, state.error]
}

export const useDataSourceListen = <T extends Doc>(type: typeof Doc, query: firebase.firestore.Query, waiting: boolean = false): [T[], boolean, Error | undefined] => {
	interface Prop {
		data: T[]
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ data: [], loading: true })
	useEffect(() => {
		let enabled = true
		const listen = async () => {
			query.onSnapshot({
				next: (snapshot) => {
					const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
					if (enabled) {
						setState({
							...state,
							loading: false,
							data
						});
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							...state,
							loading: false,
							error
						});
					}
				}
			})
		};
		setState({
			...state,
			loading: true
		})
		if (!waiting) {
			listen()
		}
		return () => {
			enabled = false
		}
	}, [waiting])
	return [state.data, state.loading, state.error]
};

export const useCart = (): [Cart | undefined, boolean, Error | undefined] => {
	const [user, isAuthLoading] = useAuthUser()
	const [cart, isLoading, error] = useDocumentListen<Cart>(Cart, user?.uid ? new Cart(user.uid).documentReference : undefined, isAuthLoading)
	return [cart, isLoading, error]
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

