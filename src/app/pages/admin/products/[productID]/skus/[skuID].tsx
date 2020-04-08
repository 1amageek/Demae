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
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Layout from 'components/admin/Layout'
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Account from 'models/account/Account'
import Product from 'models/commerce/Product'
import SKU, { Stock } from 'models/commerce/SKU'
import { useAuthUser, useProviderProductSKU } from 'hooks/commerce';
import { StockType, StockValue } from 'common/commerce/Types';

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
	const [sku] = useProviderProductSKU(productID, skuID)
	const [isEditing, setEditing] = useState(edit)
	const name = useInput(sku?.name)
	const caption = useInput(sku?.caption)
	const amount = useInput(sku?.amount)
	const currency = useInput(sku?.currency)

	const inventory = useSelect({
		initValue: sku?.inventory.type, inputProps: {
			menu: [
				{
					label: "Bucket",
					value: "bucket"
				},
				{
					label: "Finite",
					value: "finite"
				}
				, {
					label: "Infinite",
					value: "infinite"
				}
			]
		}
	})
	const stockValue = useSelect({
		initValue: sku?.inventory.value, inputProps: {
			menu: [
				{
					label: "InStock",
					value: "in_stock"
				},
				{
					label: "Limited",
					value: "limited"
				}
				, {
					label: "OutOfStock",
					value: "out_of_stock"
				}
			]
		}
	})
	const quantity = useInput(sku?.inventory.quantity)

	const [qty, setQty] = useState(0)
	useEffect(() => {
		(async () => {
			if (sku?.inventory.type === 'finite') {
				const snapshot = await sku?.inventories.collectionReference.get()
				const count = snapshot?.docs.map(doc => Stock.fromSnapshot<Stock>(doc)).reduce((prev, current) => {
					return prev + current.count
				}, 0)
				setQty(count || 0)
			}
		})()
	}, [sku?.inventory.type])


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
														sku.inventory = {
															type: inventory.value as StockType,
															quantity: Number(quantity.value),
															value: stockValue.value as StockValue
														}
														await Promise.all([sku.updateInventory(), sku.save()])
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
								<ListItem key={"inventory"}>
									<ListItemText primary={"inventory"} />
									<Select {...inventory} />
									{
										inventory.value === 'finite' && <Input {...quantity} type="number" />
									}
									{
										inventory.value === 'bucket' && <Select {...stockValue} type="number" />
									}
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
									<ListItem key={"inventory"}>
										<ListItemText primary={"inventory"} />
										{sku && sku.inventory.type === "finite" && <ListItemText primary={qty} />}
										{sku && sku.inventory.type === "infinite" && <ListItemText primary={"Infinite"} />}
										{sku && sku.inventory.type === "bucket" && <ListItemText primary={sku.inventory.value} />}
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
