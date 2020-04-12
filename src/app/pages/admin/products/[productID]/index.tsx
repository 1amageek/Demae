import React, { useState } from 'react'
import 'firebase/auth'
import Router, { useRouter } from 'next/router'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import ProductTable from 'components/admin/products/ProductTable'
import SKUPage from 'components/admin/products/skus'
import Layout from 'components/admin/Layout'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import { useAuthUser, useProviderProduct, useDataSource } from 'hooks/commerce';
import Loading from 'components/Loading'

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

export default () => {
	const router = useRouter()
	const productID = router.query.productID as string
	const [product, isLoading] = useProviderProduct(productID)
	if (isLoading || !product) {
		return <Layout><Loading /></Layout>
	}
	return <Page product={product} />
}


const Page = ({ product }: { product: Product }) => {
	const classes = useStyles()
	const router = useRouter()
	const edit = router.query.edit === 'true'
	const [authUser] = useAuthUser()
	const [skuEdit, setSKUEdit] = useState(false)
	const [sku, setSKU] = useState<SKU | undefined>(undefined)
	const [skus, isSKULoading] = useDataSource<SKU>(SKU, product.skus.collectionReference
		.orderBy('updatedAt', 'desc')
		.limit(100))

	const [isEditing] = useState(edit)
	if (isSKULoading) {
		return <Layout><Loading /></Layout>
	}

	return (
		<>
			<Layout>
				<Grid container spacing={3}>
					<Grid item xs={6}>
						<Paper className={classes.paper}>
							<ProductTable edit={isEditing} product={product!} />
						</Paper>
					</Grid>
					<Grid item xs={6}>
						<Paper className={classes.paper}>
							{product && <SKUPage product={product} skus={skus} sku={sku} setSKU={setSKU} edit={skuEdit} />}
						</Paper>
					</Grid>
				</Grid>
			</Layout >
			{
				!isEditing && <Tooltip title='SKU Add' aria-label='add' onClick={(e) => {
					e.preventDefault()
					const uid = authUser?.uid
					if (!uid) { return }
					const provider = new Provider(uid)
					const ref = provider.products.doc(product.id, Product).skus.collectionReference.doc()
					const newSKU = new SKU(ref)
					setSKUEdit(true)
					setSKU(newSKU)
				}}>
					<Fab color='secondary' className={classes.absolute}>
						<AddIcon />
					</Fab>
				</Tooltip>
			}
		</>
	)
}
