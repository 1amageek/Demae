import React from 'react'
import { useRouter } from 'next/router'
import App from 'components/App'
import Product from 'components/providers/products/Product'
import SKUList from 'components/providers/products/skus/SKUList'

export default () => {
	const router = useRouter()
	const providerID = router.query.providerID as string
	const productID = router.query.productID as string
	return (
		<App>
			<Product providerID={providerID} productID={productID} />
			<SKUList providerID={providerID} productID={productID} />
		</App>
	)
}
