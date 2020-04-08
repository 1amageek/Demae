import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ProductsTable from 'components/admin/products/ProductsTable'
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Modal from 'components/Modal';
import Layout from 'components/admin/Layout'
import Form from 'components/admin/products/Form'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import { useProvider, useDataSource, useProviderProductSKU } from 'hooks/commerce';
import Loading from 'components/Loading'
import { Provider } from 'models/commerce';
import DataSource from '../../../../../lib/DataSource';
import SKUTable from 'components/admin/products/skus/SKUTable';

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
	const skuID = router.query.skuID as string
	const [sku, isLoading, error] = useProviderProductSKU(productID, skuID)
	if (isLoading || !sku) {
		return <Layout><Loading /></Layout>
	}
	return <Page sku={sku} />
}

const Page = ({ sku }: { sku: SKU }) => {
	const classes = useStyles()
	const router = useRouter()
	const edit = router.query.edit === 'true'
	const [open, setOpen] = useState(false)

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<Layout>
				<Paper className={classes.paper}>
					<SKUTable sku={sku} edit={edit} />
				</Paper>
			</Layout>
		</>
	)
}
