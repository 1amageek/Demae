import React, { useContext } from 'react'
import ProductList from 'components/providers/products/ProductList'
import Product from 'components/providers/products/Product'
import { ProviderProductProvider } from 'hooks/commerce'

export default (props: any) => {
	const { providerID, productID } = props.match.params
	if (productID) {
		return (
			<ProviderProductProvider id={productID}>
				<Product providerID={providerID} productID={productID} />
			</ProviderProductProvider>
		)
	} else {
		return <ProductList providerID={providerID} />
	}
}
