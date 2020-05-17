import React, { useContext } from 'react'
import { Container } from '@material-ui/core'
import SKUList from 'components/providers/products/skus/'
import SKU from 'components/providers/products/skus/SKU'

export default (props: any) => {
	const { providerID, productID, skuID } = props.match.params
	if (productID && skuID) {
		return (
			<Container maxWidth='sm' disableGutters>
				<SKU providerID={providerID} productID={productID} skuID={skuID} />
			</Container>
		)
	} else {
		return (
			<Container maxWidth='sm'>
				<SKUList providerID={providerID} productID={productID} />
			</Container>
		)
	}
}
