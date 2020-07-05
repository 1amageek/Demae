
import React, { useState } from "react"
import firebase from "firebase/app";
import IconButton from "@material-ui/core/IconButton";
import { Box, Paper, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import ImageIcon from "@material-ui/icons/Image";
import DataLoading from "components/DataLoading";
import SegmentControl, { useSegmentControl } from "components/SegmentControl"
import { ListItemSecondaryAction, Switch } from "@material-ui/core";
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar";
import { useHistory, useParams } from "react-router-dom";
import { useDataSourceListen, Where, OrderBy } from "hooks/firestore"
import { useAdminProviderProducts, useAdminProvider, useUser } from "hooks/commerce";
import Product from "models/commerce/Product"
import { Symbol } from "common/Currency"
import { useTheme } from "@material-ui/core/styles";

const TabLabels = [
	{
		label: "All",
		value: undefined
	},
	{
		label: "Open",
		value: true
	},
	{
		label: "Close",
		value: false
	},
]

export default () => {
	const history = useHistory()
	const { productID } = useParams()
	const [segmentControl] = useSegmentControl(TabLabels.map(value => value.label))
	const [provider, waiting] = useAdminProvider()
	const isAvailable = TabLabels[segmentControl.selected].value
	const collectionReference = provider ? provider.products.collectionReference : undefined
	const wheres = [
		isAvailable !== undefined ? Where("isAvailable", "==", isAvailable) : undefined,
	].filter(value => !!value)
	const [orderBy] = useState<firebase.firestore.OrderByDirection>("desc")
	const [products, isLoading] = useDataSourceListen<Product>(Product, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy("createdAt", orderBy)
	}, waiting)

	const addProduct = async (e) => {
		e.preventDefault()
		if (!provider) return
		const product = new Product(provider.products.collectionReference.doc())
		product.providedBy = provider.id
		product.name = "No name"
		product.isAvailable = false
		await product.save()
		history.push(`/admin/products/${product.id}`)
	}

	return (
		<Box height="100%">
			<Box paddingX={1} display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h1">Product</Typography>
				<IconButton
					color="inherit"
					onClick={addProduct}
					edge="start"
				>
					<AddIcon color="primary" />
				</IconButton>
			</Box>
			<Box padding={1}>
				<SegmentControl {...segmentControl} />
			</Box>

			{isLoading ?
				<DataLoading /> :
				<List style={{
					height: "100%"
				}}>
					{products.map(data => {
						return (
							<ListItem key={data.id} button selected={productID === data.id} onClick={() => {
								history.push(`/admin/products/${data.id}`)
							}}>
								<ProductListItem key={data.id} productID={productID} product={data} />
							</ListItem>
						)
					})}
				</List>
			}
		</Box>
	)
}

const ProductListItem = ({ productID, product }: { productID?: string, product: Product }) => {
	const [user] = useUser()
	const history = useHistory()
	const theme = useTheme()
	const price = product.price || {}
	const currency = user?.currency || "USD"
	const symbol = Symbol(currency)
	const amount = price[currency] || 0
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined
	const priceWithSymbol = amount > 0 ? `${symbol}${amount}` : ""
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	return (
		<>
			<ListItemAvatar>
				<Avatar variant="rounded" src={imageURL} >
					<ImageIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={product.name} secondary={priceWithSymbol} />
			<ListItemSecondaryAction>
				<Switch
					edge="end"
					// color="default"
					onChange={async (e) => {
						e.preventDefault()
						setProcessing(true)
						const snapshot = await product.skus.collectionReference.where("isAvailable", "==", true).get()
						if (snapshot.empty) {
							setProcessing(false)
							setMessage("error", `To publish ${product.name}, add the available SKUs.`)
						} else {
							product.isAvailable = !product.isAvailable
							await product.save()
							setProcessing(false)
							setMessage("success", `${product.name} is published`)
						}
					}}
					checked={product.isAvailable}
				/>
			</ListItemSecondaryAction>
		</>
	)
}
