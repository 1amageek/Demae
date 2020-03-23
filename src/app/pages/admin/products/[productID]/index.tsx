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
import Modal from 'components/Modal';
import Layout from 'components/admin/Layout'
import Form from 'components/account/products/Form'
import Input, { useInput } from 'components/Input'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import { useAuthUser, useProviderProduct } from 'hooks';

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
	const authUser = useAuthUser()
	const product = useProviderProduct(id)
	const [isEditing, setEditing] = useState(edit)
	const name = useInput(product?.name)
	const caption = useInput(product?.caption)
	const description = useInput(product?.description)

	const [skus, setSKUs] = useState<SKU[]>([])
	useEffect(() => {
		const uid = authUser?.uid
		if (!uid) { return }
		(async () => {
			const provider = new Provider(uid)
			const snapshot = await provider.products.doc(id, Product).skus.collectionReference
				.orderBy('updatedAt', 'desc')
				.limit(100)
				.get()
			const skus = snapshot.docs.map(doc => SKU.fromSnapshot<SKU>(doc))
			setSKUs([...skus])
		})()
	}, [authUser?.uid])

	return (
		<>
			<Layout>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
								<Toolbar>
									<Grid container spacing={2} alignItems="center">
										<Grid item>
											<Link href='/admin/products'>
												<Tooltip title="Back">
													<IconButton>
														<ArrowBackIcon className={classes.block} color="inherit" />
													</IconButton>
												</Tooltip>
											</Link>
										</Grid>
										<Grid item>
											{
												isEditing ? (
													<>
														<Button variant="contained" color="primary" className={classes.addAction} onClick={async () => {

															if (product) {
																product.name = name.value
																product.caption = caption.value
																product.description = description.value
																await product.save()
															}

															setEditing(false)
														}}>SAVE</Button>
														<Button variant="contained" color="primary" className={classes.addAction} onClick={() => {
															setEditing(false)
														}}>CANCEL</Button>
													</>
												) : (
														<Button variant="contained" color="primary" className={classes.addAction} onClick={() => {
															setEditing(true)
														}}>EDIT</Button>
													)
											}
										</Grid>
									</Grid>
								</Toolbar>
							</AppBar>
							{
								isEditing ? (
									<List >
										<ListItem key={"ID"} >
											<ListItemText primary={"ID"} />
											{product && <ListItemText primary={product.id} />}
										</ListItem>
										<ListItem key={"name"} >
											<ListItemText primary={"name"} />
											<Input {...name} />
										</ListItem>
										<ListItem key={"caption"}>
											<ListItemText primary={"caption"} />
											<Input {...caption} />
										</ListItem>
										<ListItem key={"description"}>
											<ListItemText primary={"description"} />
											<Input {...description} />
										</ListItem>
										<ListItem key={"status"}>
											<ListItemText primary={"status"} />
											{product && <ListItemText primary={product.isAvailable ? "Available" : "Disabled"} />}
										</ListItem>
									</List>
								) : (
										<List >
											<ListItem key={"ID"} >
												<ListItemText primary={"ID"} />
												{product && <ListItemText primary={product.id} />}
											</ListItem>
											<ListItem key={"name"} >
												<ListItemText primary={"name"} />
												{product && <ListItemText primary={product.name} />}
											</ListItem>
											<ListItem key={"caption"}>
												<ListItemText primary={"caption"} />
												{product && <ListItemText primary={product.caption} />}
											</ListItem>
											<ListItem key={"description"}>
												<ListItemText primary={"description"} />
												{product && <ListItemText primary={product.description} />}
											</ListItem>
											<ListItem key={"status"}>
												<ListItemText primary={"status"} />
												{product && <ListItemText primary={product.isAvailable ? "Available" : "Disabled"} />}
											</ListItem>
										</List>
									)
							}
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>ID</TableCell>
										<TableCell>Name</TableCell>
										<TableCell>Price</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{skus.map(sku => {
										return (
											<Link href={`/admin/products/${id}/skus/${sku.id}`} key={sku.id} >
												<TableRow hover>
													<TableCell>{sku.id}</TableCell>
													<TableCell>{sku.name}</TableCell>
													<TableCell>{sku.currency} {sku.amount.toLocaleString()}</TableCell>
												</TableRow>
											</Link>
										)
									})}
								</TableBody>
							</Table>
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
