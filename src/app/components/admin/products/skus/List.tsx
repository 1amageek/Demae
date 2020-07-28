
import React, { useState } from "react"
import firebase from "firebase/app";
import { Link } from "react-router-dom"
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Grid, Typography, Chip, IconButton, Divider, Avatar } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ImageIcon from "@material-ui/icons/Image";
import DataLoading from "components/DataLoading";
import SegmentControl, { useSegmentControl } from "components/SegmentControl"
import { Switch } from "@material-ui/core";
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar";
import { useHistory, useParams } from "react-router-dom";
import { useDataSourceListen, Where, OrderBy } from "hooks/firestore"
import { useAdminProvider, useUser } from "hooks/commerce";
import SKU from "models/commerce/SKU"
import { useListToolbar, useListHeader } from "components/NavigationContainer"

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

	useListHeader(() => {
		return (
			<>
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
			</>
		)
	})

	return (
		<Box height="100%">
			{isLoading ? <DataLoading /> : <SKUList skus={skus} />}
		</Box>
	)
}

const SKUList = ({ skus }: { skus: SKU[] }) => {
	return (
		<Box>
			{
				skus.map((sku, index) => {
					return <SKUListItem key={index} sku={sku} />
				})
			}
		</Box>
	)
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		list: {
			textDecoration: "none",
			color: "inherit",
			"& > *:hover": {
				backgroundColor: "rgba(0, 0, 0, 0.018)"
			},
		},
		tags: {
			display: 'flex',
			flexWrap: 'wrap',
			marginTop: theme.spacing(1),
			'& > *': {
				margin: theme.spacing(0.3),
			},
		},
	}),
);

const SKUListItem = ({ sku }: { sku: SKU }) => {
	const classes = useStyles();
	const [user] = useUser()
	const { productID, skuID } = useParams()
	const currency = sku.currency
	const amount = sku.price || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency }).format(amount)
	const imageURL = sku.imageURLs().length > 0 ? sku.imageURLs()[0] : undefined
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	return (
		<Link className={classes.list} to={`/admin/products/${productID}/skus/${sku.id}`}>
			<Box>
				<Box padding={1} paddingY={2} style={{
					backgroundColor: skuID === sku.id ? "rgba(0, 0, 140, 0.03)" : "inherit"
				}}>
					<Grid container>
						<Grid item xs={1}>
						</Grid>
						<Grid item xs={2}>
							<Avatar variant="rounded" src={imageURL} >
								<ImageIcon />
							</Avatar>
						</Grid>
						<Grid item xs={9}>
							<Box display="flex" justifyContent="space-between">
								<Box>
									<Typography variant="subtitle1">{sku.name}</Typography>
									<Typography variant="body2">{price}</Typography>
								</Box>
								<Box>
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
								</Box>
							</Box>

							<Box className={classes.tags}>
								{
									sku.tags.map((tag, index) => {
										return <Chip key={index} size="small" label={tag} />
									})
								}
							</Box>
						</Grid>
					</Grid>
				</Box>
				<Divider />
			</Box>
		</Link>
	)
}
