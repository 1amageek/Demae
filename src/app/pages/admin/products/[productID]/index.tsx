import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import 'firebase/auth'
import Link from 'next/link'
import Router from 'next/router'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ProductTable from 'components/admin/products/ProductTable'
import SKUsTable from 'components/admin/products/skus/SKUsTable'
import Layout from 'components/admin/Layout'
import Form from 'components/admin/products/Form'
import Input, { useInput } from 'components/Input'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import { useAuthUser, useProviderProduct, useDataSource } from 'hooks/commerce';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			maxWidth: 936,
			margin: 'auto',
			overflow: 'hidden',
		},
		searchBar: {
			borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
		},
		searchInput: {
			fontSize: theme.typography.fontSize,
		},
		block: {
			display: 'block',
		},
		addAction: {
			marginRight: theme.spacing(1),
		},
		contentWrapper: {
			margin: '40px 16px',
		},
		absolute: {
			position: 'absolute',
			bottom: theme.spacing(2),
			right: theme.spacing(3),
		},
	}),
);

const index = ({ id, edit }: { id: string, edit: boolean }) => {
	const classes = useStyles()
	const [authUser] = useAuthUser()
	const [product, isProductLoading] = useProviderProduct(id)
	const [skus, isSKULoading] = useDataSource<SKU>(SKU, product?.skus.collectionReference
		.orderBy('updatedAt', 'desc')
		.limit(100))

	const [isEditing, setEditing] = useState(edit)

	return (
		<>
			<Layout>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<ProductTable edit={isEditing} product={product!} />
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							{product && <SKUsTable product={product} skus={skus} />}
						</Paper>
					</Grid>
				</Grid>
			</Layout >
			{
				!isEditing && <Tooltip title="SKU Add" aria-label="add" onClick={(e) => {
					e.preventDefault()
					const uid = authUser?.uid
					if (!uid) { return }
					const provider = new Provider(uid)
					const ref = provider.products.doc(id, Product).skus.collectionReference.doc()
					Router.push({ pathname: `/admin/products/${id}/skus/${ref.id}`, query: { edit: true } })
				}}>
					<Fab color="secondary" className={classes.absolute}>
						<AddIcon />
					</Fab>
				</Tooltip>
			}
		</>
	)
}

index.getInitialProps = async (ctx) => {
	const id = ctx.query.productID
	const edit = ctx.query.edit || false
	return { id, edit }
}

export default index
