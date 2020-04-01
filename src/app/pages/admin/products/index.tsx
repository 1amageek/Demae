import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Router from 'next/Router'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ProductTable from 'components/admin/products/ProductsTable'
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Modal from 'components/Modal';
import Layout from 'components/admin/Layout'
import Form from 'components/admin/products/Form'
import Product from 'models/commerce/Product'
import { useProvider, useDataSource } from 'hooks/commerce';
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
	const classes = useStyles()
	const [provider] = useProvider()
	const [open, setOpen] = useState(false)
	const [products, isLoading] = useDataSource<Product>(Product, provider?.products.collectionReference
		.orderBy('updatedAt', 'desc')
		.limit(100))

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	if (isLoading) {
		return <Layout><Loading /></Layout>
	}

	return (
		<>
			<Layout>
				<Paper className={classes.paper}>
					<AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
						<Toolbar>
							<Grid container spacing={2} alignItems="center">
								<Grid item>
									<SearchIcon className={classes.block} color="inherit" />
								</Grid>
								<Grid item xs>
									<TextField
										fullWidth
										placeholder="Search by email address, phone number, or user UID"
										InputProps={{
											disableUnderline: true,
											className: classes.searchInput,
										}}
									/>
								</Grid>
								<Grid item>
									<Button variant="contained" color="primary" className={classes.addAction} onClick={() => {
										// handleOpen()
									}}>
										Add Product
              	</Button>
									<Tooltip title="Reload">
										<IconButton>
											<RefreshIcon className={classes.block} color="inherit" />
										</IconButton>
									</Tooltip>
								</Grid>
							</Grid>
						</Toolbar>
					</AppBar>
					<ProductTable products={products} />
				</Paper>
			</Layout>
			<Tooltip title="Product Add" aria-label="add" onClick={(e) => {
				e.preventDefault()
				if (provider) {
					const ref = provider.products.collectionReference.doc()
					Router.push({ pathname: `/admin/products/${ref.id}`, query: { edit: true } })
				}
			}}>
				<Fab color="secondary" className={classes.absolute}>
					<AddIcon />
				</Fab>
			</Tooltip>
			<Modal
				open={open}
				onClose={handleClose}
			>
				<div className={classes.paper}>
					<Form product={new Product()} />
				</div>
			</Modal>
		</>
	)
}
