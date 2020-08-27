
import React, { useState } from "react"
import firebase from "firebase"
import ReactMde from "react-mde";
import Showdown from "showdown";
import Markdown from "react-markdown"
import { File as StorageFile } from "@1amageek/ballcap"
import { Link } from "react-router-dom"
import { Typography, Box, Paper, FormControl, Button, ListItemSecondaryAction } from "@material-ui/core";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import { ProductDraft, DeliveryMethod } from "models/commerce/Product"
import DataLoading from "components/DataLoading";
import SaveIcon from "@material-ui/icons/Save";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Select, { useSelect, useMenu } from "components/_Select"
import { useAdminProviderProductDraft } from "hooks/commerce";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Label from "components/Label";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import { useProviderBlank, useUser } from "hooks/commerce"
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
	const theme = useTheme();
	const [provider] = useProviderBlank()
	const [product, isLoading] = useAdminProviderProductDraft()
	const [isEditing, setEdit] = useEdit()
	const [showDrawer, closeDrawer] = useDrawer()
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
								closeDrawer()
								return
							}
							showProcessing(true)
							const newProduct = new ProductDraft(provider.productDrafts.collectionReference.doc())
							newProduct.setData(product.data())
							newProduct.name = product.name + " - copy"
							await newProduct.save()
							showSnackbar("success", "Copied.")
							closeDrawer()
							showProcessing(false)
						}
					}
				]
			} />
		)
	}

	const publish = () => {
		showDrawer(
			<ActionSheet title={`Do you want to publish "${product?.name}"?`} actions={
				[
					{
						title: "Publish",
						handler: async () => {
							if (!product || !provider) {
								closeDrawer()
								return
							}
							showProcessing(true)
							const productPublish = firebase.functions().httpsCallable("commerce-v1-product-publish")
							try {
								const response = await productPublish({ productDraftPath: product.path })
								const { error } = response.data
								if (error) {
									showSnackbar("error", error.message)
									showProcessing(false)
									return
								}
								showSnackbar("success", "Published.")
							} catch (error) {
								showSnackbar("error", "Failed to publish the product.")
								console.error(error)
							}
							closeDrawer()
							showProcessing(false)
						}
					}
				]
			} />
		)
	}

	useContentToolbar(() => {
		if (!product) return <></>
		if (isEditing) {
			return (
				<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
					<Button variant="outlined" color="primary" size="small" onClick={() => setEdit(false)}>Cancel</Button>
					<Button variant="contained" color="primary" size="small" type="submit"
						startIcon={
							<SaveIcon />
						}
					>Save</Button>
				</Box>
			)
		}
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
				<Box>
					<NavigationBackButton title="Products" href="/admin/products/drafts" />
				</Box>
				<Box display="flex" flexGrow={1} justifyContent="flex-end">
					<Button variant="outlined" color="primary" size="small" style={{ marginRight: theme.spacing(1) }} onClick={copy}>Copy</Button>
					<Button variant="outlined" color="primary" size="small" style={{ marginRight: theme.spacing(1) }} onClick={() => setEdit(true)}>Edit</Button>
					<Button variant="contained" color="primary" size="small" onClick={publish}>Publish</Button>
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

	if (isEditing) {
		return <Edit product={product} onClose={() => {
			setEdit(false)
		}} />
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
							<ListItem button component={Link} to={`/admin/products/drafts/${product.id}/skus`}>
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

const Edit = ({ product, onClose }: { product: ProductDraft, onClose: () => void }) => {
	const theme = useTheme();
	const [setProcessing] = useProcessing()
	const [images, setImages] = useState<File[]>([])

	const [name] = useTextField(product.name)
	const [caption] = useTextField(product.caption)
	const [description, setDescription] = useState(product.description || "");
	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
	const [deliveryMethod, setDeliveryMethod] = useSelect(product.deliveryMethod)

	const [showDrawer, closeDrawer] = useDrawer()
	const [showSnackbar] = useSnackbar()

	const deliveryMethodMenu = useMenu([
		{
			label: "In-Store",
			value: "none"
		},
		{
			label: "Download",
			value: "download"
		},
		{
			label: "Pickup",
			value: "pickup"
		},
		{
			label: "Shipping required",
			value: "shipping"
		},
	])

	useEdit(async (event) => {
		event.preventDefault()
		if (!product) return
		setProcessing(true)
		const uploadedImages = await Promise.all(uploadImages(images))
		if (uploadedImages.length) {
			const fileterd = uploadedImages.filter(image => !!image) as StorageFile[]
			product.images = fileterd
		}
		product.name = name.value as string
		product.caption = caption.value as string
		product.description = description
		product.deliveryMethod = deliveryMethod.value as DeliveryMethod

		await product.save()
		setProcessing(false)
		onClose()

		if (!product.isAvailable) {
			showDrawer(
				<ActionSheet title="Do you want to make the Product available?" actions={
					[
						{
							title: "YES",
							handler: async () => {
								product.isAvailable = true
								await product.update()
								showSnackbar("success", `You must publish your product for the changes to take effect.`)
								closeDrawer()
							}
						}
					]
				} />
			)
		}
	})

	const uploadImages = (files: File[]) => {
		return files.map(file => {
			return uploadImage(file)
		})
	}

	const extension = (type: string) => {
		if (type === "image/jpeg") return "jpg"
		if (type === "image/png") return "png"
	}

	const uploadImage = (file: File): Promise<StorageFile | undefined> => {
		const id = firebase.firestore().collection("/dummy").doc().id
		const ref = firebase.storage().ref(product!.documentReference.path + `/images/${id}.${extension(file.type)}`)
		return new Promise((resolve, reject) => {
			ref.put(file).then(async (snapshot) => {
				if (snapshot.state === "success") {
					const storageFile = new StorageFile()
					if (snapshot.metadata.contentType) {
						storageFile.mimeType = snapshot.metadata.contentType
					}
					storageFile.path = ref.fullPath
					resolve(storageFile)
				} else {
					reject(undefined)
				}
			})
		})
	}

	const updatedAt = Dayjs(product.updatedAt.toDate())
	return (
		<Paper elevation={0} square={false} style={{
			height: "100%",
			margin: theme.spacing(2)
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
									Delivery Method <Label marginX={1} color="gray" fontSize={11}>{deliveryMethodLabel[product.deliveryMethod]}</Label>
								</Typography>
							</Box>
						</Box>
					</Box>
					<Divider />
					<Box paddingY={2}>
						<MediaController URLs={product.imageURLs()} isEditing maxCount={MAXIMUM_NUMBER_OF_IMAGES}
							onDrop={(files) => {
								setImages(files)
							}}
							onDeleteImage={async (props) => {
								const { index } = props
								showDrawer(
									<ActionSheet title="Do you want to delete the image?" actions={
										[
											{
												title: "Delete",
												handler: async () => {
													const image = product.images[index]
													const imageData = image.data()
													await product.documentReference.update({
														images: firebase.firestore.FieldValue.arrayRemove(imageData)
													})
													showSnackbar("success", "The image has been removed.")
													closeDrawer()
												}
											}
										]
									} />
								)
							}}
							onDeleteUploadImage={(props) => {
								const { index } = props
								const _images = images.filter((value, idx) => index !== idx)
								setImages(_images)
							}}
							onError={() => {
								showSnackbar("error", `The maximum number of images is ${MAXIMUM_NUMBER_OF_IMAGES}.`)
							}} />
						<Box paddingTop={2}>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Delivery</Typography>
								<FormControl variant="outlined" size="small">
									<Select variant="outlined" {...deliveryMethod} >
										{deliveryMethodMenu}
									</Select>
								</FormControl>
							</Box>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Name</Typography>
								<TextField variant="outlined" margin="dense" required {...name} fullWidth />
							</Box>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Caption</Typography>
								<TextField variant="outlined" margin="dense" required {...caption} fullWidth />
							</Box>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Description</Typography>
								<ReactMde
									value={description}
									onChange={setDescription}
									selectedTab={selectedTab}
									onTabChange={setSelectedTab}
									generateMarkdownPreview={markdown =>
										Promise.resolve(converter.makeHtml(markdown))
									}
								/>
							</Box>
						</Box>
					</Box>
				</article>
			</Box>
		</Paper >
	)
}
