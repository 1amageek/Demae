
import React, { useState } from 'react'
import firebase from 'firebase'
import { File as StorageFile } from '@1amageek/ballcap'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import IconButton from '@material-ui/core/IconButton';
import DndCard from 'components/DndCard'
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Product from 'models/commerce/Product'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import Board from '../Board';
import { useProviderProduct, ProviderProductProvider } from 'hooks/commerce';
import SKUList from './SKUList';
import SKUDetail from './SKUDetail';

export default (props: any) => {
	const { productID, skuID } = props.match.params

	return (
		<Box>
			<ProviderProductProvider id={productID}>
				<Breadcrumbs style={{ height: '40px' }}>
					<Link to='/admin/products'>Products</Link>
					{productID && <Link to={`/admin/products/${productID}`}>{productID}</Link>}
					{productID && <Link to={`/admin/products/${productID}/skus`}>SKUs</Link>}
					{productID && skuID && <Link to={`/admin/products/${productID}/skus`}>SKUs</Link>}
				</Breadcrumbs>
				<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
					<Grid item xs={3}>
						<ProductList productID={productID} />
					</Grid>
					<Grid item xs={3}>
						<ProductDetail />
					</Grid>
					<Grid item xs={3}>
						<SKUList productID={productID} />
					</Grid>
					<Grid item xs={3}>
						<SKUDetail productID={productID} skuID={skuID} />
					</Grid>
				</Grid>
			</ProviderProductProvider>
		</Box>

		// <Box display='flex'>
		// 	<Box height="100%"><ProductList productID={productID} /></Box>
		// 	<Box flexGrow={1}>
		// 		<ProviderProductProvider id={productID}>
		// 			<ProductDetail />
		// 		</ProviderProductProvider>
		// 	</Box>
		// 	<Box>
		// 		<ProviderProductProvider id={productID}>
		// 			<ProductDetail />
		// 		</ProviderProductProvider>
		// 	</Box>
		// </Box>
	)
}
