import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import 'firebase/auth'
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Layout from 'components/admin/Layout'
import Input, { useInput } from 'components/Input'
import Account from 'models/account/Account'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import { useAuthUser, useProviderProductSKU } from 'hooks';

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

const index = ({ productID, skuID, edit }: { productID: string, skuID: string, edit: boolean }) => {
	const classes = useStyles();
	const [authUser] = useAuthUser()
	const [sku] = useProviderProductSKU(productID, skuID)
	const [isEditing, setEditing] = useState(edit)
	const name = useInput(sku?.name)
	const caption = useInput(sku?.caption)
	const amount = useInput(sku?.amount)
	const currency = useInput(sku?.currency)

	return (
		<>
			<Layout>
				<Paper className={classes.paper}>
					<AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
						<Toolbar>
							<Grid container spacing={2} alignItems="center">
								<Grid item>
									<Link href={`/admin/products/${productID}`}>
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

													if (sku) {
														sku.name = name.value
														sku.caption = caption.value
														sku.amount = Number(amount.value)
														await sku.save()
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
									{sku && <ListItemText primary={sku.id} />}
								</ListItem>
								<ListItem key={"name"} >
									<ListItemText primary={"name"} />
									<Input {...name} />
								</ListItem>
								<ListItem key={"caption"}>
									<ListItemText primary={"caption"} />
									<Input {...caption} />
								</ListItem>
								<ListItem key={"amount"}>
									<ListItemText primary={"amount"} />
									<Input {...amount} type="number" />
								</ListItem>
								<ListItem key={"status"}>
									<ListItemText primary={"status"} />
									{sku && <ListItemText primary={sku.isAvailable ? "Available" : "Disabled"} />}
								</ListItem>
							</List>
						) : (
								<List >
									<ListItem key={"ID"} >
										<ListItemText primary={"ID"} />
										{sku && <ListItemText primary={sku.id} />}
									</ListItem>
									<ListItem key={"name"} >
										<ListItemText primary={"name"} />
										{sku && <ListItemText primary={sku.name} />}
									</ListItem>
									<ListItem key={"caption"}>
										<ListItemText primary={"caption"} />
										{sku && <ListItemText primary={sku.caption} />}
									</ListItem>
									<ListItem key={"amount"}>
										<ListItemText primary={"amount"} />
										{sku && <ListItemText primary={sku.amount} />}
									</ListItem>
									<ListItem key={"status"}>
										<ListItemText primary={"status"} />
										{sku && <ListItemText primary={sku.isAvailable ? "Available" : "Disabled"} />}
									</ListItem>
								</List>
							)
					}
				</Paper>
			</Layout>
		</>
	)
}

index.getInitialProps = async (ctx) => {
	const productID = ctx.query.productID
	const skuID = ctx.query.skuID
	const edit = ctx.query.edit || false
	return { productID, skuID, edit }
}

export default index
