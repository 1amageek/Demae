import React from 'react'
import { useRouter } from 'next/router'
import App from 'components/App'
import Provider from 'components/providers/Provider'
import ProductList from 'components/providers/products/ProductList'

export default () => {
	const router = useRouter()
	const providerID = router.query.providerID as string
	return (
		<App>
			<Provider providerID={providerID} />
			<ProductList providerID={providerID} />
		</App>
	)
}
