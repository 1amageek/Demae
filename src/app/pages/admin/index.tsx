import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Modal from 'components/Modal';
import Layout from 'components/Layout'
import Form from 'components/accounts/products/Form'
import Account from 'models/commerce/Account'
import Product from 'models/commerce/Product'
import { useCurrentUser } from 'hooks'

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
	}),
);

export default () => {
	const classes = useStyles();
	const user = useCurrentUser()
	const [product, setProduct] = useState<Product | undefined>()
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (user) {
			const account = new Account(user?.uid)
			const product = new Product(account.products.collectionReference.doc())
			setProduct(product)
		}
	}, [user?.uid])

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
										handleOpen()
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

					<Table>
						<TableHead>
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell>Name</TableCell>
								<TableCell>Status</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<Link href="/admin/products">
								<TableRow hover key={"order.id"}>
									<TableCell>ID</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Status</TableCell>
								</TableRow>
							</Link>
						</TableBody>
					</Table>
				</Paper>
			</Layout>
			<Modal
				open={open}
				onClose={handleClose}
			>
				<div className={classes.paper}>
					<Form product={product!} />
				</div>
			</Modal>
		</>
	)
}
