
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden } from '@material-ui/core';
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import Board from '../Board';
import { useProviderProduct, ProviderProductProvider, ProviderProductSKUProvider } from 'hooks/commerce';
import SKUList from './SKUList';
import SKUDetail from './SKUDetail';

export default (props: any) => {
	const { productID, skuID } = props.match.params

	return (
		<Box height='100%'>
			<ProviderProductProvider id={productID}>
				<ProviderProductSKUProvider id={skuID}>
					<Breadcrumbs style={{ height: '40px' }}>
						<Link to='/admin/products'>Products</Link>
						{productID && <Link to={`/admin/products/${productID}`}>{productID}</Link>}
						{productID && skuID && <Link to={`/admin/products/${productID}/skus`}>SKUs</Link>}
						{productID && skuID && <Link to={`/admin/products/${productID}/skus`}>{skuID}</Link>}
					</Breadcrumbs>
					<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
						<Grid item xs>
							<ProductList productID={productID} />
						</Grid>
						<Grid item xs>
							<ProductDetail />
						</Grid>
						<Grid item xs>
							{productID && <SKUList productID={productID} />}
						</Grid>
						<Grid item xs>
							{productID && skuID && <SKUDetail productID={productID} skuID={skuID} />}
						</Grid>
					</Grid>
				</ProviderProductSKUProvider>
			</ProviderProductProvider>
		</Box>
	)
}
