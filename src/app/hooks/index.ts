import { useEffect, useState } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { Doc, DocumentReference } from '@1amageek/ballcap'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'

export const useAuthUser = () => {
	const [authUser, setAuthUser] = useState<firebase.User | undefined>(undefined)
	useEffect(() => {
		const user = localStorage.getItem('authUser')
		if (user) {
			const parsedUser = JSON.parse(user)
			if (authUser?.uid !== parsedUser.uid) {
				setAuthUser(parsedUser as firebase.User)
			}
		} else {
			setAuthUser(undefined)
		}
	})
	return authUser
}

export const useProvider = () => {
	const user = useAuthUser()
	const [provider, setProvider] = useState<Provider | undefined>(undefined)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!provider) {
					let provider = await Provider.get<Provider>(user.uid)
					setProvider(provider)
				}
			}
		})()
	}, [user?.uid, provider?.id])
	return provider
}

export const useProviderProduct = (id: string) => {
	const user = useAuthUser()
	const [product, setProduct] = useState<Product | undefined>(undefined)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!product) {
					const snapshot = await new Provider(user.uid).products.collectionReference.doc(id).get()
					let product = Product.fromSnapshot<Product>(snapshot)
					setProduct(product)
				}
			}
		})()
	}, [user?.uid, product?.id])
	return product
}

export const useProviderProductSKU = (productID: string, skuID: string) => {
	const user = useAuthUser()
	const [sku, setSKU] = useState<SKU | undefined>(undefined)
	useEffect(() => {
		(async () => {
			if (user) {
				if (!sku) {
					const snapshot = await new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID).get()
					let sku = SKU.fromSnapshot<SKU>(snapshot)
					setSKU(sku)
				}
			}
		})()
	}, [user?.uid, sku?.id])
	return sku
}

export const useDocument = <T extends Doc>(documentReference: DocumentReference, type: typeof Doc): [T | undefined, boolean] => {
	const [data, setData] = useState<T | undefined>()
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			const snapshot = await documentReference.get()
			console.log(snapshot)
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

