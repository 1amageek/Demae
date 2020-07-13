
import React, { useState, useImperativeHandle, useRef } from "react"
import firebase from "firebase"
import { File as StorageFile } from "@1amageek/ballcap"
import { Link, useParams } from "react-router-dom"
import { Typography, Box, Paper, FormControl, Button, Grid, ListItemSecondaryAction, Chip } from "@material-ui/core";
import Input, { useInput } from "components/Input"
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import { CurrencyCode, SupportedCurrencies } from "common/Currency"
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import DataLoading from "components/DataLoading";
import DndCard from "components/DndCard"
import SaveIcon from "@material-ui/icons/Save";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { useHistory } from "react-router-dom";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import Select, { useSelect, useMenu } from "components/_Select"
import { StockType, StockValue } from "common/commerce/Types";
import { SKU, Product } from "models/commerce";
import InventoryTableRow from "../Inventory";
import { useAdminProvider, useAdminProviderProduct, useAdminProviderProductSKU } from "hooks/commerce";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import { useDocumentListen, useDataSourceListen, OrderBy } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import { Activity, Comment, ChangeDeliveryStatus } from "models/commerce/Order"
import { useAuthUser } from "hooks/auth";
import { useProcessing } from "components/Processing";
import Carousel from "components/Carousel"
import MediaController from "components/MediaController"

Dayjs.extend(relativeTime)

const MAXIMUM_NUMBER_OF_IMAGES = 10

export default () => {
	const theme = useTheme();
	const { productID, skuID } = useParams()
	const [provider] = useAdminProvider()
	const ref = skuID ? provider?.documentReference
		.collection("products").doc(productID)
		.collection("skus").doc(skuID) : undefined
	const [sku, isLoading] = useDocumentListen<SKU>(SKU, ref)
	const [isEditing, setEdit] = useEdit()

	useContentToolbar(() => {
		if (!sku) return <></>
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
					<NavigationBackButton title="SKU" href={`/admin/products/${productID}/skus`} />
				</Box>
				<Box display="flex" flexGrow={1} justifyContent="flex-end">
					<Button variant="outlined" color="primary" size="small" onClick={() => setEdit(true)}>Edit</Button>
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

	if (isEditing) {
		return (
			<Edit sku={sku} onClose={() => {
				setEdit(false)
			}} />
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
										<Typography variant="body1" gutterBottom>{sku.description}</Typography>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Price</Typography>
										<Typography variant="body1" gutterBottom>{sku.currency} {sku.price.toLocaleString()}</Typography>
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

const Edit = ({ sku, onClose }: { sku: SKU, onClose: () => void }) => {
	const theme = useTheme();
	const [setProcessing] = useProcessing()
	const [product] = useAdminProviderProduct()
	const [images, setImages] = useState<File[]>([])
	const [name] = useTextField(sku?.name)
	const [caption] = useTextField(sku?.caption)
	const [price, setPrice] = useTextField(String(sku?.price))
	const [taxRate, setTaxRate] = useTextField(String(sku?.taxRate))
	const [description] = useTextField(sku?.description)

	const [currency, setCurrency] = useSelect(sku.currency)
	const [inventory, setInventory] = useSelect(sku.inventory.type)
	const [stockValue, setStockValue] = useSelect(sku.inventory.value || "in_stock")
	const [quantity] = useTextField(String(sku.inventory.quantity || 0))

	const [showDrawer, drawerClose] = useDrawer()
	const [showSnackbar] = useSnackbar()

	const currencyMenu = useMenu(SupportedCurrencies.map(c => {
		return {
			label: `${c.code} ${c.symbol}`,
			value: c.code,
		}
	}))

	const inventoryMenu = useMenu([
		{
			label: "Bucket",
			value: "bucket"
		},
		{
			label: "Finite",
			value: "finite"
		},
		{
			label: "Infinite",
			value: "infinite"
		}
	])

	const stockValueMenu = useMenu([
		{
			label: "In Stock",
			value: "in_stock"
		},
		{
			label: "Limited",
			value: "limited"
		},
		{
			label: "Out Of Stock",
			value: "out_of_stock"
		}
	])

	const [isEditing] = useEdit(async (event) => {
		event.preventDefault()
		if (!product) return
		if (!sku) return
		setProcessing(true)
		const batch = firebase.firestore().batch()
		const uploadedImages = await Promise.all(uploadImages(images))

		sku.name = name.value as string
		sku.caption = caption.value as string
		sku.description = description.value as string
		sku.price = Number(price.value)
		sku.taxRate = Number(taxRate.value)
		sku.currency = currency.value as CurrencyCode
		sku.inventory = {
			type: inventory.value as StockType,
			value: stockValue.value as StockValue,
			quantity: Number(quantity.value)
		}
		sku.productReference = product.documentReference

		const nowPrice = product.price || {}
		var productPrice = nowPrice[sku.currency] || Infinity
		productPrice = Math.min(productPrice, sku.price)
		productPrice = Math.max(productPrice, 0)

		if (uploadedImages.length) {
			const fileterd = uploadedImages.filter(image => !!image) as StorageFile[]
			const images = fileterd.map(value => value.data())
			console.log(images)
			batch.set(sku.documentReference, {
				...sku.data(),
				images: firebase.firestore.FieldValue.arrayUnion(...images)
			}, { merge: true })
		} else {
			batch.set(sku.documentReference, {
				...sku.data(),
			}, { merge: true })
		}

		batch.update(product.documentReference, {
			price: {
				...nowPrice,
				[sku.currency]: productPrice
			}
		})

		await batch.commit()
		setProcessing(false)
		onClose()
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
								<MediaController URLs={sku.imageURLs()} isEditing maxCount={MAXIMUM_NUMBER_OF_IMAGES}
									onDrop={(files) => {
										setImages(files)
									}}
									onDeleteImage={async (props) => {
										const { index } = props
										showDrawer(
											<ActionSheet callback={async () => {
												const image = sku.images[index]
												const imageData = image.data()
												await sku.documentReference.update({
													images: firebase.firestore.FieldValue.arrayRemove(imageData)
												})
												showSnackbar("success", "The image has been removed.")
												drawerClose()
											}} onClose={drawerClose} />
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
										<Typography variant="subtitle1" gutterBottom>Name</Typography>
										<TextField variant="outlined" margin="dense" required {...name} fullWidth />
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Caption</Typography>
										<TextField variant="outlined" margin="dense" required {...caption} fullWidth />
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Description</Typography>
										<TextField variant="outlined" margin="dense" required fullWidth multiline rows={8} {...description} />
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Price</Typography>
										<Box display="flex">
											<FormControl variant="outlined" size="small" margin="dense">
												<Select variant="outlined" {...currency} >
													{currencyMenu}
												</Select>
											</FormControl>
											<TextField variant="outlined" margin="dense" required {...price} style={{
												marginLeft: "8px"
											}} />
										</Box>
									</Box>
									<Box paddingBottom={2}>
										<Typography variant="subtitle1" gutterBottom>Inventory</Typography>
										<FormControl variant="outlined" size="small">
											<Select variant="outlined" {...inventory} >
												{inventoryMenu}
											</Select>
										</FormControl>
										{inventory.value === "bucket" &&
											<FormControl variant="outlined" size="small" style={{ marginLeft: "8px" }}>
												<Select variant="outlined" {...stockValue}>
													{stockValueMenu}
												</Select>
											</FormControl>
										}
									</Box>
								</Box>
							</Box>
						</article>
					</Box>
				</Paper >
			</Box>

			{inventory.value === "finite" &&
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
		</Paper>

	)
}

const ActionSheet = ({ callback, onClose }: { callback: () => void, onClose: () => void }) => {
	return (
		<Paper>
			<Box>
				<Box padding={2}>
					<Typography variant="subtitle1">Do you want to delete the image?</Typography>
				</Box>
				<List>
					<ListItem button onClick={callback}>
						<ListItemText primary="Delete" />
					</ListItem>
				</List>
				<Divider />
				<List>
					<ListItem button onClick={onClose}>
						<ListItemText primary="Close" />
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
