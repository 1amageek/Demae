
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden } from '@material-ui/core';
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import Board from '../Board';
import { AdminProviderProductProvider, AdminProviderProductSKUProvider } from 'hooks/commerce';
import SKUList from './SKUList';
import SKUDetail from './SKUDetail';
import StockDetail from './StockDetail';

export default (props: any) => {
	const { productID, skuID } = props.match.params

	return (
		<Box height='100%'>
			<AdminProviderProductProvider id={productID}>
				<AdminProviderProductSKUProvider id={skuID}>
					<Box py={2}>
						<Breadcrumbs>
							<Link to='/admin/products'>Products</Link>
							{productID && <Link to={`/admin/products/${productID}`}>{productID}</Link>}
							{productID && skuID && <Link to={`/admin/products/${productID}/skus`}>SKUs</Link>}
							{productID && skuID && <Link to={`/admin/products/${productID}/skus`}>{skuID}</Link>}
						</Breadcrumbs>
					</Box>

					<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
						<Content productID={productID} skuID={skuID} />
					</Grid>
				</AdminProviderProductSKUProvider>
			</AdminProviderProductProvider>
		</Box>
	)
}

const Content = ({ productID, skuID }: { productID?: string, skuID: string }) => {
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down('sm'));

	if (matches) {
		if (productID && skuID) {
			return (
				<Grid item xs={12}>
					<SKUDetail productID={productID} skuID={skuID} />
				</Grid>
			)
		}

		if (productID) {
			return (
				<>
					<Grid item xs={12}>
						<ProductDetail />
					</Grid>
					<Grid item xs={12}>
						{productID && <SKUList productID={productID} />}
					</Grid>
				</>
			)
		}

		return (
			<Grid item xs={12}>
				<ProductList productID={productID} />
			</Grid>
		)
	}

	return (
		<Grid container alignItems="stretch" spacing={1} style={{ width: '100%' }}>
			<Grid item xs={4}>
				<ProductList productID={productID} />
			</Grid>
			<Grid item xs={4}>
				<ProductDetail />
				{productID && <SKUList productID={productID} />}
			</Grid>
			<Grid item xs={4}>
				{productID && skuID && <SKUDetail productID={productID} skuID={skuID} />}
			</Grid>
		</Grid>
	)
}
