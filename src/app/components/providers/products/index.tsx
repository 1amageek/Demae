import React, { useContext } from 'react'
import ProductList from 'components/providers/products/ProductList'
import Product from 'components/providers/products/Product'

export default (props: any) => {
	const { providerID, productID } = props.match.params
	if (productID) {
		return <Product providerID={providerID} productID={productID} />
	} else {
		return <ProductList providerID={providerID} />
	}
}
