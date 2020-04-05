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

export const useAuthUser = (): [firebase.User | undefined, boolean] => {
	const [authUser, setAuthUser] = useState<firebase.User | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			if (authUser?.uid !== parsedUser.uid) {
				setAuthUser(parsedUser as firebase.User)
			}
			setLoading(false)
		} else {
			setAuthUser(undefined)
			setLoading(false)
		}
	})
	return [authUser, isLoading]
}

export const useAdmin = (): [string | undefined, boolean] => {
	const [admin, setAdmin] = useState<string | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		const claims = localStorage.getItem('claims')
		if (claims) {
			const parsedClaims = JSON.parse(claims)
			if (admin !== parsedClaims.admin) {
				setAdmin(parsedClaims.admin)
			}
			setLoading(false)
		} else {
			setAdmin(undefined)
			setLoading(false)
		}
	}, [admin])
	return [admin, isLoading]
}

export const useProvider = (): [Provider | undefined, boolean] => {
	const [adminID, isAdminLoading] = useAdmin()
	const [provider, setProvider] = useState<Provider | undefined>(undefined)
	const [isLoading, setLoading] = useState(isAdminLoading)
	useEffect(() => {
		if (adminID) {
			(async () => {
				const provider = await Provider.get<Provider>(adminID)
				if (provider) {
					setProvider(provider)
				}
				setLoading(false)
			})()
		} else {
			setLoading(false)
		}
	}, [adminID])
	return [provider, isLoading]
}

export const useProviderProduct = (id: string): [Product | undefined, boolean] => {
	const [user] = useAuthUser()
	const [product, setProduct] = useState<Product | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!product) {
					const snapshot = await new Provider(user.uid).products.collectionReference.doc(id).get()
					let product = Product.fromSnapshot<Product>(snapshot)
					setProduct(product)
					setLoading(false)
				}
			}
		})()
	}, [user?.uid, product?.id])
	return [product, isLoading]
}

export const useProviderProductSKU = (productID: string, skuID: string): [SKU | undefined, boolean] => {
	const [user] = useAuthUser()
	const [sku, setSKU] = useState<SKU | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!sku) {
					const snapshot = await new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID).get()
					let sku = SKU.fromSnapshot<SKU>(snapshot)
					setSKU(sku)
					setLoading(false)
				}
			}
		})()
	}, [user?.uid, sku?.id])
	return [sku, isLoading]
}

export const useDocument = <T extends Doc>(documentReference: DocumentReference, type: typeof Doc): [T | undefined, boolean] => {
	const [data, setData] = useState<T | undefined>()
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			const snapshot = await documentReference.get()
			const doc = type.fromSnapshot<T>(snapshot)
			setData(doc)
			setLoading(false)
		})()
	}, [data?.id])
	return [data, isLoading]
}

export const useDataSource = <T extends Doc>(type: typeof Doc, query?: firebase.firestore.Query): [T[], boolean] => {
	const [data, setData] = useState<T[]>([])
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		if (query) {
			(async () => {
				setLoading(true)
				const snapshot = await query.get()
				const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
				setData(data)
				setLoading(false)
			})()
		}
		setLoading(false)
	}, [data.length, query])
	return [data, isLoading]
}

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

