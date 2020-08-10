
import React, { useState, useImperativeHandle, useRef } from "react"
import Showdown from "showdown";
import Markdown from "react-markdown"
import { useParams, useHistory } from "react-router-dom"
import { Typography, Box, Paper, Button, Chip, InputAdornment, Divider } from "@material-ui/core";
import DataLoading from "components/DataLoading";
import { ProductDraft, Product, SKU } from "models/commerce";
import InventoryTableRow from "../../Inventory";
import { useAdminProvider, useAdminProviderProduct } from "hooks/commerce";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import { useDocumentListen } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import { useProcessing } from "components/Processing";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import ActionSheet from "components/ActionSheet"
import MediaController from "components/MediaController"

Dayjs.extend(relativeTime)

const MAXIMUM_NUMBER_OF_IMAGES = 10

const converter = new Showdown.Converter({
	tables: true,
	simplifiedAutoLink: true,
	strikethrough: true,
	tasklists: true
});

export default () => {
	const theme = useTheme()
	const history = useHistory()
	const { productID, skuID } = useParams()
	const [provider] = useAdminProvider()
	const ref = skuID ? provider?.documentReference
		.collection("products").doc(productID)
		.collection("skus").doc(skuID) : undefined
	const [sku, isLoading] = useDocumentListen<SKU>(SKU, ref)
	const [showDrawer, drawerClose] = useDrawer()
	const [showSnackbar] = useSnackbar()
	const [showProcessing] = useProcessing()

	const copy = () => {
		showDrawer(
			<ActionSheet title={`Do you want to copy "${sku?.name}"?`} actions={
				[
					{
						title: "Copy",
						handler: async () => {
							if (!provider || !sku) {
								drawerClose()
								return
							}
							showProcessing(true)
							const productRef = provider.productDrafts.collectionReference.doc(productID)
							const draft = await ProductDraft.get<ProductDraft>(productRef)
							if (!draft) {
								const product = await Product.get<Product>(productRef)
								if (!product) {
									showSnackbar("error", "Product not exist.")
									drawerClose()
									showProcessing(false)
									return
								}
								const newDraft = new ProductDraft(productRef)
								newDraft.setData(product.data())
								await newDraft.save()
							}

							const ref = provider.productDrafts.collectionReference.doc(productID).collection("skus").doc()
							const newSKU = new SKU(ref)
							newSKU.setData(sku.data())
							newSKU.name = sku.name + " - copy"
							newSKU.isAvailable = false
							await newSKU.save()
							drawerClose()
							showProcessing(false)
							history.push(`/admin/products/drafts/${productID}/skus/${newSKU.id}`)
						}
					}
				]
			} />
		)
	}

	const edit = () => {
		showDrawer(
			<ActionSheet title={`Do you want to edit "${sku?.name}"?`} actions={
				[
					{
						title: "Edit",
						handler: async () => {
							if (!provider || !sku) {
								drawerClose()
								return
							}
							showProcessing(true)
							const productRef = provider.productDrafts.collectionReference.doc(productID)
							const productDraft = await ProductDraft.get<ProductDraft>(productRef)
							if (!productDraft) {
								const product = await Product.get<Product>(productRef)
								if (!product) {
									showSnackbar("error", "Product not exist.")
									drawerClose()
									showProcessing(false)
									return
								}
								const newDraft = new ProductDraft(productRef)
								newDraft.setData(product.data())
								await newDraft.save()
							}

							const ref = provider.productDrafts.collectionReference.doc(productID).collection("skus").doc(skuID)
							const draft = await SKU.get<SKU>(ref)
							if (!draft) {
								const newSKU = new SKU(ref)
								newSKU.setData(sku.data())
								await newSKU.save()
							}
							showSnackbar("success", "Copied.")
							drawerClose()
							showProcessing(false)
							history.push(`/admin/products/drafts/${productID}/skus/${skuID}`)
						}
					}
				]
			} />
		)
	}

	useContentToolbar(() => {
		if (!sku) return <></>
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
				<Box>
					<NavigationBackButton title="SKU" href={`/admin/products/public/${productID}/skus`} />
				</Box>
				<Box display="flex" flexGrow={1} justifyContent="flex-end">
					<Button variant="outlined" color="primary" size="small" style={{ marginRight: theme.spacing(1) }} onClick={copy}>Copy</Button>
					<Button variant="outlined" color="primary" size="small" onClick={edit}>Edit</Button>
				</Box>
			</Box>
		)
	})

	if (isLoading) {
		return (
			<Box padding={2} height="100%" display="flex" alignItems="center">
				<DataLoading />
			</Box>
		)
	}

	if (!sku) {
		return (
			<Paper elevation={0} style={{
				height: "100%"
			}}>
				<Box padding={2} height="100%" display="flex" justifyContent="center" alignItems="center">
					<Typography variant="subtitle1" color="textSecondary">No item is selected.</Typography>
				</Box>
			</Paper>
		)
	}

	const updatedAt = Dayjs(sku.updatedAt.toDate())
	return (
		<Paper elevation={0} style={{
			height: "100%",
			width: "100%",
			background: "inherit"
		}}>
			<Box width="100%" padding={2}>
				<Paper elevation={0} square={false} style={{
					height: "100%",
					width: "100%",
					marginBottom: theme.spacing(2)
				}}>
					<Box padding={2} height="100%">
						<article>
							<Box paddingBottom={1} display="flex">
								<Box flexGrow={1}>
									<Typography variant="h2">{sku.name}</Typography>
									<Box color="text.secondary">
										<Typography variant="caption">
											{`ID: ${sku.id}`} - {updatedAt.format("YYYY-MM-DD HH:mm:ss")}
										</Typography>
									</Box>
									<Box display="flex" alignItems="center" paddingY={1}>
										<Typography variant="subtitle1" style={{
											marginRight: theme.spacing(0.5),
										}}>Inventory Type</Typography>
										<Chip label={sku.inventory.type} variant="outlined" />
									</Box>
								</Box>
							</Box>
							<Divider />
							<Box paddingY={2}>
								<MediaController URLs={sku.imageURLs()} />
								<Box paddingTop={2}>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Caption</Typography>
										<Typography variant="body1" gutterBottom>{sku.caption}</Typography>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Description</Typography>
										<Markdown source={sku.description}></Markdown>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Price</Typography>
										<Typography variant="body1" gutterBottom>{sku.currency} {sku.price.toLocaleString()}</Typography>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Tax rate</Typography>
										<Typography variant="body1" gutterBottom>{sku.taxRate.toLocaleString()}%</Typography>
									</Box>
								</Box>
							</Box>
						</article>
					</Box>
				</Paper >
			</Box>

			{
				sku.inventory.type === "finite" &&
				<Box padding={2} width="100%">
					<Typography variant="h2" gutterBottom>Inventory</Typography>
					<Paper elevation={0} square={false} style={{
						height: "100%",
						marginBottom: theme.spacing(2)
					}}>
						<Box>
							<InventoryTableRow sku={sku} />
						</Box>
					</Paper>
					<Typography variant="body2" gutterBottom>Manage inventory, including different sizes and colors.</Typography>
				</Box>
			}
		</Paper >
	)
}
