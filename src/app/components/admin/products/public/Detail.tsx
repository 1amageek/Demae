
import React, { useState } from "react"
import firebase from "firebase"
import ReactMde from "react-mde";
import Showdown from "showdown";
import Markdown from "react-markdown"
import { File as StorageFile } from "@1amageek/ballcap"
import { Link, useHistory } from "react-router-dom"
import { Typography, Box, Paper, FormControl, Button, ListItemSecondaryAction } from "@material-ui/core";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import Product, { ProductDraft, DeliveryMethod } from "models/commerce/Product"
import DataLoading from "components/DataLoading";
import SaveIcon from "@material-ui/icons/Save";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Select, { useSelect, useMenu } from "components/_Select"
import { useAdminProviderProduct } from "hooks/commerce";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Label from "components/Label";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import { useAdminProvider, useUser } from "hooks/commerce"
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

const deliveryMethodLabel: { [key in DeliveryMethod]: string } = {
	"none": "In-Store",
	"download": "Download",
	"pickup": "Pickup",
	"shipping": "Shipping required"
}

export default () => {
	const theme = useTheme()
	const history = useHistory()
	const [provider] = useAdminProvider()
	const [product, isLoading] = useAdminProviderProduct()
	const [showDrawer, drawerClose] = useDrawer()
	const [showSnackbar] = useSnackbar()
	const [showProcessing] = useProcessing()

	const copy = () => {
		showDrawer(
			<ActionSheet title={`Do you want to copy "${product?.name}"?`} actions={
				[
					{
						title: "Copy",
						handler: async () => {
							if (!product || !provider) {
								drawerClose()
								return
							}
							showProcessing(true)
							const newProduct = new ProductDraft(provider.productDrafts.collectionReference.doc())
							newProduct.setData(product.data())
							newProduct.name = product.name + " - copy"
							await newProduct.save()
							showSnackbar("success", "Copied.")
							drawerClose()
							showProcessing(false)
							history.push(`/admin/products/drafts/${newProduct.id}`)
						}
					}
				]
			} />
		)
	}

	const edit = () => {
		showDrawer(
			<ActionSheet title={`Do you want to edit "${product?.name}"?`} actions={
				[
					{
						title: "Edit",
						handler: async () => {
							if (!product || !provider) {
								drawerClose()
								return
							}
							showProcessing(true)
							const ref = provider.productDrafts.collectionReference.doc(product.id)
							const draftProduct = await ProductDraft.get<ProductDraft>(ref)
							if (!draftProduct) {
								const newProduct = new ProductDraft(ref)
								newProduct.setData(product.data())
								await newProduct.save()
							}
							showSnackbar("success", "Please Edit.")
							drawerClose()
							showProcessing(false)
							history.push(`/admin/products/drafts/${product.id}`)
						}
					}
				]
			} />
		)
	}

	useContentToolbar(() => {
		if (!product) return <></>
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
				<Box>
					<NavigationBackButton title="Products" href="/admin/products/public" />
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

	if (!product) {
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

	const updatedAt = Dayjs(product.updatedAt.toDate())
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
									<Typography variant="h2">{product.name}</Typography>
									<Box color="text.secondary">
										<Typography variant="caption">
											{`ID: ${product.id}`} - {updatedAt.format("YYYY-MM-DD HH:mm:ss")}
										</Typography>
									</Box>
									<Box display="flex" paddingY={1}>
										<Typography variant="subtitle1">
											{/* Access Control <Label marginX={1} color="gray" fontSize={11}>{product.accessControl}</Label> */}
									Delivery Method <Label marginX={1} color="gray" fontSize={11}>{deliveryMethodLabel[product.deliveryMethod]}</Label>
										</Typography>
									</Box>
								</Box>
							</Box>
							<Divider />
							<Box paddingY={2}>
								<MediaController URLs={product.imageURLs()} />
								<Box paddingTop={2}>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Caption</Typography>
										<Typography variant="body1" gutterBottom>{product.caption}</Typography>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Description</Typography>
										<Markdown source={product.description}></Markdown>
									</Box>
								</Box>
							</Box>
						</article>
					</Box>
				</Paper >
			</Box>

			<Box padding={2} width="100%">
				<Typography variant="h2" gutterBottom>Inventory</Typography>
				<Paper elevation={0} square={false} style={{
					height: "100%",
					marginBottom: theme.spacing(2)
				}}>
					<Box>
						<List>
							<ListItem button component={Link} to={`/admin/products/public/${product.id}/skus`}>
								<ListItemText primary="SKU" primaryTypographyProps={{ variant: "subtitle1" }} />
								<ListItemSecondaryAction><NavigateNextIcon /></ListItemSecondaryAction>
							</ListItem>
						</List>
					</Box>
				</Paper>
				<Typography variant="body2" gutterBottom>Manage inventory, including different sizes and colors.</Typography>
			</Box>
		</Paper>
	)
}
