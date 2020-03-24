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
import Address from 'models/commerce/Address'

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

export const useProvider = (): [Provider | undefined, boolean] => {
	const [user] = useAuthUser()
	const [provider, setProvider] = useState<Provider | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!provider) {
					let provider = await Provider.get<Provider>(user.uid)
					setProvider(provider)
					setLoading(false)
				}
			}
		})()
	}, [user?.uid, provider?.id])
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
	}, [data?.id, isLoading])
	return [data, isLoading]
}

export const useDataSource = <T extends Doc>(query: firebase.firestore.Query, type: typeof Doc): [T[], boolean] => {
	const [data, setData] = useState<T[]>([])
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			const snapshot = await query.get()
			const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
			setData(data)
			setLoading(false)
		})()
	}, [data.length, isLoading])
	return [data, isLoading]
}

export const useCart = (): [Cart | undefined, boolean] => {
	const [user] = useAuthUser()
	const [cart, setCart] = useState<Cart | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!cart) {
					let cart = await Cart.get<Cart>(user.uid) || new Cart(user.uid)
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
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (auth) {
				if (!user) {
					let user = await User.get<User>(auth.uid) || new User(auth.uid)
					setUser(user)
					setLoading(false)
				}
			}
		})()
	}, [auth?.uid, user?.id])
	return [user, isLoading]
}

export const useUserAddress = (id: string): [Address | undefined, boolean] => {
	const [auth] = useAuthUser()
	const [address, setAddress] = useState<Address | undefined>(undefined)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			if (auth) {
				if (!address) {
					const snapshot = await new User(auth.uid).addresses.collectionReference.doc(id).get()
					let address = Address.fromSnapshot<Address>(snapshot)
					setAddress(address)
					setLoading(false)
				}
			}
		})()
	}, [auth?.uid, address?.id])
	return [address, isLoading]
}

