
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
import { useAdminProvider, useUser } from "hooks/commerce";
import SKU from "models/commerce/SKU"
import { Symbol } from "common/Currency"
import { useListToolbar } from "components/NavigationContainer"

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
	const collectionReference = provider && productID ? provider.products.collectionReference.doc(productID).collection("skus") : undefined
	const wheres = [
		isAvailable !== undefined ? Where("isAvailable", "==", isAvailable) : undefined,
	].filter(value => !!value)
	const [orderBy] = useState<firebase.firestore.OrderByDirection>("desc")
	const [skus, isLoading] = useDataSourceListen<SKU>(SKU, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy("createdAt", orderBy)
	}, waiting)

	const addSKU = async (e) => {
		e.preventDefault()
		if (!provider) return
		if (!productID) return
		const sku = new SKU(provider.products.collectionReference.doc(productID).collection('skus').doc())
		sku.providedBy = provider.id
		sku.name = "No name"
		sku.isAvailable = false
		await sku.save()
		history.push(`/admin/products/${productID}/skus/${sku.id}`)
	}

	useListToolbar({
		title: "Product",
		href: `/admin/products/${productID}`
	})

	return (
		<Box height="100%">
			<Box paddingX={1} display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h1">SKU</Typography>
				<IconButton
					color="inherit"
					onClick={addSKU}
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
					{skus.map(data => {
						return (
							<SKUListItem key={data.id} productID={productID} sku={data} />
						)
					})}
				</List>
			}
		</Box>
	)
}

const SKUListItem = ({ productID, sku }: { productID?: string, sku: SKU }) => {
	const [user] = useUser()
	const history = useHistory()
	const price = sku.price
	const currency = sku.currency
	const symbol = Symbol(currency)
	const amount = price[currency] || 0
	const imageURL = sku.imageURLs().length > 0 ? sku.imageURLs()[0] : undefined

	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	return (
		<>
			<ListItem key={sku.id} button selected={productID === sku.id} onClick={() => {
				history.push(`/admin/products/${productID}/skus/${sku.id}`)
			}}>
				<ListItemAvatar>
					<Avatar variant="rounded" src={imageURL} >
						<ImageIcon />
					</Avatar>
				</ListItemAvatar>
				<ListItemText primary={sku.name} secondary={`${symbol} ${price.toLocaleString()}`} />
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						onChange={async (e) => {
							e.preventDefault()
							setProcessing(true)
							if (!sku.isAvailable) {
								if (sku.inventory.type === "finite") {
									const snapshot = await sku.stocks.collectionReference.get()
									const count = snapshot.docs.reduce((prev, current) => {
										return prev + current.data()!["count"]
									}, 0)
									if (count <= 0) {
										setProcessing(false)
										setMessage("error", `To publish ${sku.name}, Add stock or change the inventory.`)
										return
									}
								}
							}
							sku.isAvailable = !sku.isAvailable
							await sku.save()
							setProcessing(false)
							setMessage("success", `${sku.name} is published`)
						}}
						checked={sku.isAvailable}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}
