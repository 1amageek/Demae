import { useEffect, useState } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { Doc } from '@1amageek/ballcap'
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

export const useDataSource = <T extends Doc>(query: firebase.firestore.Query, type: typeof Doc) => {
	const [data, setData] = useState<T[]>([])
	useEffect(() => {
		(async () => {
			const snapshot = await query.get()
			const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
			setData(data)
		})()
	}, [data.length])
	return data
}

