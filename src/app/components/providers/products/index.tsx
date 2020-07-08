import React, { useContext } from "react"
import { Container } from "@material-ui/core"
import ProductList from "components/providers/products/ProductList"
import Product from "components/providers/products/Product"

export default (props: any) => {
	const { providerID, productID } = props.match.params
	if (productID) {
		return (
			<Container maxWidth="sm" disableGutters>
				<Product providerID={providerID} productID={productID} />
			</Container>
		)
	} else {
		return (
			<Container maxWidth="sm" >
				<ProductList />
			</Container>
		)
	}
}
