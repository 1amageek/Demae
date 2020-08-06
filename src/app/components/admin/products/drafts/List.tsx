
import React, { useState } from "react"
import firebase from "firebase/app";
import { Link } from "react-router-dom"
import { Box, Paper, Grid, Typography, Chip, IconButton, Divider } from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import ImageIcon from "@material-ui/icons/Image";
import DataLoading from "components/DataLoading";
import SegmentControl, { useSegmentControl } from "components/SegmentControl"
import { Switch } from "@material-ui/core";
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar";
import { useHistory, useParams } from "react-router-dom";
import { useDataSourceListen, Where, OrderBy } from "hooks/firestore"
import { useAdminProvider, useUser } from "hooks/commerce"
import { useListHeader } from "components/NavigationContainer"
import { DeliveryMethodLabel } from "hooks/commerce/DeliveryMethod"
import { ProductDraft } from "models/commerce/Product"
import { CurrencyCode } from "common/Currency"


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

const DeliveryMethodLables = [{
	label: "All",
	value: undefined
}].concat(Object.keys(DeliveryMethodLabel).map(key => {
	return {
		label: DeliveryMethodLabel[key],
		value: key,
	}
}) as any[])

export default () => {
	const history = useHistory()
	const { productID } = useParams()
	const [segmentControl] = useSegmentControl(TabLabels.map(value => value.label))
	const [deliveryMethodControl] = useSegmentControl(DeliveryMethodLables.map(value => value.label))
	const [provider, waiting] = useAdminProvider()
	const isAvailable = TabLabels[segmentControl.selected].value
	const deliveryMethod = DeliveryMethodLables[deliveryMethodControl.selected].value
	const collectionReference = provider ? provider.productDrafts.collectionReference : undefined
	const wheres = [
		isAvailable !== undefined ? Where("isAvailable", "==", isAvailable) : undefined,
		deliveryMethod !== undefined ? Where("deliveryMethod", "==", deliveryMethod) : undefined,
	].filter(value => !!value)
	const [orderBy] = useState<firebase.firestore.OrderByDirection>("desc")
	const [products, isLoading] = useDataSourceListen<ProductDraft>(ProductDraft, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy("createdAt", orderBy)
	}, waiting)

	const addProduct = async (e) => {
		e.preventDefault()
		if (!provider) return
		const product = new ProductDraft(provider.productDrafts.collectionReference.doc())
		product.providedBy = provider.id
		product.name = "No name"
		await product.save()
		history.push(`/admin/products/drafts/${product.id}`)
	}

	useListHeader(() => {
		return (
			<>
				<Box paddingX={1} display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h1">Product drafts</Typography>
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
				<Box padding={1} paddingTop={0}>
					<SegmentControl {...deliveryMethodControl} />
				</Box>
			</>
		)
	})

	return (
		<Box height="100%">
			{isLoading ?
				<DataLoading /> : <ProductList products={products} />
			}
		</Box>
	)
}

const ProductList = ({ products }: { products: ProductDraft[] }) => {
	return (
		<Box>
			{
				products.map((product, index) => {
					return <ProductListItem key={index} product={product} />
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

const ProductListItem = ({ product }: { product: ProductDraft }) => {
	const classes = useStyles();
	const [user] = useUser()
	const { productID } = useParams()
	const prices = product.price
	const currencies = Object.keys(prices) as CurrencyCode[]
	const userCurrency = user?.currency ?? "USD"
	const currency = currencies.includes(userCurrency) ? userCurrency : (currencies[0] || "USD")
	const amount = prices[currency] || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency }).format(amount)
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	return (
		<Link className={classes.list} to={`/admin/products/drafts/${product.id}`}>
			<Box>
				<Box padding={1} paddingY={2} style={{
					backgroundColor: productID === product.id ? "rgba(0, 0, 140, 0.03)" : "inherit"
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
									<Typography variant="subtitle1">{product.name}</Typography>
									<Typography variant="body2">{price}</Typography>
								</Box>
								{/* <Box>
									<Switch
										edge="end"
										onChange={async (e) => {
											e.preventDefault()
											setProcessing(true)
											const snapshot = await product.skus.collectionReference.where("isAvailable", "==", true).get()

											if (snapshot.empty) {
												setProcessing(false)
												setMessage("error", `To publish ${product.name}, add the available SKUs.`)
												return
											}

											if (product.images.length === 0) {
												setProcessing(false)
												setMessage("error", `The product must be set with one or more images.`)
												return
											}

											product.isAvailable = !product.isAvailable
											await product.save()
											setProcessing(false)
											setMessage("success", `${product.name} is published`)

										}}
										checked={product.isAvailable}
									/>
								</Box> */}
							</Box>

							<Box className={classes.tags}>
								<Chip size="small" label={DeliveryMethodLabel[product.deliveryMethod]} />
								{
									product.tags.map((tag, index) => {
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
