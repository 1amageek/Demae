
import React, { useState, useImperativeHandle, useRef } from "react"
import firebase from "firebase"
import ReactMde from "react-mde";
import Showdown from "showdown";
import Markdown from "react-markdown"

import { File as StorageFile } from "@1amageek/ballcap"
import { useParams } from "react-router-dom"
import { Typography, Box, Paper, FormControl, Button, Chip, InputAdornment, Divider } from "@material-ui/core";
import { CurrencyCode, SupportedCurrencies } from "common/Currency"
import DataLoading from "components/DataLoading";
import SaveIcon from "@material-ui/icons/Save";
import Select, { useSelect, useMenu } from "components/_Select"
import { StockType, StockValue } from "common/commerce/Types";
import { SKU } from "models/commerce";
import InventoryTableRow from "../Inventory";
import { useAdminProvider, useAdminProviderProductDraft } from "hooks/commerce";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import { useDocumentListen } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
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
	const theme = useTheme();
	const { productID, skuID } = useParams()
	const [provider] = useAdminProvider()
	const ref = skuID ? provider?.documentReference
		.collection("productDrafts").doc(productID)
		.collection("skus").doc(skuID) : undefined
	const [sku, isLoading] = useDocumentListen<SKU>(SKU, ref)
	const [isEditing, setEdit] = useEdit()
	const [showDrawer, drawerClose] = useDrawer()
	const [showSnackbar] = useSnackbar()

	const copy = () => {
		showDrawer(
			<ActionSheet title={`Do you want to copy "${sku?.name}"?`} actions={
				[
					{
						title: "Copy",
						handler: async () => {
							if (!sku) {
								drawerClose()
								return
							}
							const newSKU = new SKU(sku?.documentReference.parent.doc())
							newSKU.setData(sku.data())
							newSKU.name = sku.name + "- copy"
							newSKU.isAvailable = false
							await newSKU.save()
							showSnackbar("success", "Copied.")
							drawerClose()
						}
					}
				]
			} />
		)
	}

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
					<NavigationBackButton title="SKU" href={`/admin/products/drafts/${productID}/skus`} />
				</Box>
				<Box display="flex" flexGrow={1} justifyContent="flex-end">
					<Button variant="outlined" color="primary" size="small" style={{ marginRight: theme.spacing(1) }} onClick={copy}>Copy</Button>
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

const Edit = ({ sku, onClose }: { sku: SKU, onClose: () => void }) => {
	const theme = useTheme();
	const [setProcessing] = useProcessing()
	const [product] = useAdminProviderProductDraft()
	const [images, setImages] = useState<File[]>([])
	const [name] = useTextField(sku?.name)
	const [caption] = useTextField(sku?.caption)
	const [price, setPrice] = useTextField(String(sku?.price), { inputProps: { pattern: "^[0-9]*$" } })
	const [taxRate, setTaxRate] = useTextField(String(sku?.taxRate), { inputProps: { pattern: "^([1-9]|[1-9][0-9])$" } })

	const [currency, setCurrency] = useSelect(sku.currency)
	const [inventory, setInventory] = useSelect(sku.inventory.type)
	const [stockValue, setStockValue] = useSelect(sku.inventory.value || "in_stock")
	const [quantity] = useTextField(String(sku.inventory.quantity || 0))

	const [description, setDescription] = useState(sku?.description || "");
	const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

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

	useEdit(async (event) => {
		event.preventDefault()
		if (!product) return
		if (!sku) return
		setProcessing(true)
		const batch = firebase.firestore().batch()
		const uploadedImages = await Promise.all(uploadImages(images))

		const priceValue = price.value as string
		const taxRateValue = taxRate.value as string
		sku.name = name.value as string
		sku.caption = caption.value as string
		sku.description = description
		sku.price = Number(priceValue.replace(",", ""))
		sku.taxRate = Number(taxRateValue.replace(",", ""))
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
											<ActionSheet title="Do you want to delete the image?" actions={
												[
													{
														title: "Delete",
														handler: async () => {
															const image = sku.images[index]
															const imageData = image.data()
															await sku.documentReference.update({
																images: firebase.firestore.FieldValue.arrayRemove(imageData)
															})
															showSnackbar("success", "The image has been removed.")
															drawerClose()
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
										<Typography variant="subtitle1" gutterBottom>TaxRate</Typography>
										<Box display="flex">
											<TextField variant="outlined" margin="dense" required {...taxRate} InputProps={{
												endAdornment: <InputAdornment position="end">%</InputAdornment>
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
