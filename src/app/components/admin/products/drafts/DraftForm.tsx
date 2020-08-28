import React, { useState } from "react";
import firebase from "firebase"
import { File as StorageFile, DocumentReference } from "@1amageek/ballcap"
import { Container, FormControl, Button, Paper, Box, Typography, InputAdornment, FormControlLabel, Checkbox, Divider, FormHelperText } from "@material-ui/core";
import Select, { useSelect, useMenu } from "components/_Select"
import { SupportedCurrencies, CurrencyCode, Symbol } from "common/Currency"
import { SupportedCountries, CountryCode } from "common/Country"
import { StockType, StockValue } from "common/commerce/Types";
import TextField, { useTextField } from "components/TextField"
import { Batch } from "@1amageek/ballcap";
import { useProviderBlank } from "hooks/commerce"
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar";
import { ProductDraft, SalesMethod } from "models/commerce/Product"
import SKU from "models/commerce/SKU"
import MediaController from "components/MediaController"

const MAXIMUM_NUMBER_OF_IMAGES = 10

export default ({ onClose }: { onClose: () => void }) => {

	const [provider] = useProviderBlank()
	const [setProcessing] = useProcessing()
	const [showSnackbar] = useSnackbar()

	const [salesMethod] = useSelect("online")
	const [images, setImages] = useState<File[]>([])
	const [name] = useTextField("", { inputProps: { pattern: "^.{1,32}" }, required: true })
	const [caption] = useTextField("", { inputProps: { pattern: "^.{1,32}" }, required: true })
	const [price] = useTextField(String(100), { inputProps: { pattern: "^[0-9]*$" } })
	const [taxRate] = useTextField(String(8), { inputProps: { pattern: "^([1-9]|[1-9][0-9])$" } })
	const currencyInitValue = (provider?.country === "JP") ? "JPY" : "USD"
	const [currency] = useSelect(currencyInitValue)
	const currencyMenu = useMenu(SupportedCurrencies.map(currency => {
		return { label: `${currency.code} (${currency.name})`, value: currency.code }
	}))

	const [inventory,] = useSelect("finite")
	const [stockValue,] = useSelect("in_stock")
	const [quantity] = useTextField(String(10), { inputProps: { pattern: "^[0-9]*$" } })

	const salesMethodMenu = useMenu([
		{
			label: "Online",
			value: "online"
		},
		{
			label: "In Store",
			value: "instore"
		},
		{
			label: "Pickup",
			value: "pickup"
		},
		{
			label: "Download",
			value: "download"
		}
	])

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

	const quantityError = Number(quantity.value as string) === 0

	const disabled: boolean = (name.value as string).length === 0 || (price.value as string).length === 0 || quantityError

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!provider) return

		setProcessing(true)

		const product = new ProductDraft(provider.productDrafts.collectionReference.doc())
		const productImages = await Promise.all(uploadImages(images, product.documentReference))
		const sku = new SKU(product.skus.collectionReference.doc())
		const SKUImages = await Promise.all(uploadImages(images, sku.documentReference))

		const currencyValue = currency.value as CurrencyCode
		const priceValue = (price.value as string).replace(",", "")
		const taxRateValue = (taxRate.value as string).replace(",", "")
		const quantityValue = (quantity.value as string).replace(",", "")

		product.isAvailable = true
		product.providedBy = provider.id
		product.salesMethod = salesMethod.value as SalesMethod
		product.name = name.value as string
		product.caption = caption.value as string
		product.images = productImages.filter(image => !!image) as StorageFile[]
		product.price = {
			[currencyValue]: Number(priceValue)
		}

		sku.isAvailable = true
		sku.providedBy = provider.id
		sku.name = name.value as string
		sku.caption = caption.value as string
		sku.images = SKUImages.filter(image => !!image) as StorageFile[]
		sku.productReference = product.documentReference

		sku.price = Number(priceValue)
		sku.taxRate = Number(taxRateValue)
		sku.currency = currencyValue
		sku.inventory = {
			type: inventory.value as StockType,
			value: stockValue.value as StockValue,
			quantity: Number(quantityValue)
		}

		const batch = new Batch()
		batch.save(product)
		batch.save(sku)
		await batch.commit()

		if (sku.inventory.type === "finite") {
			await sku.updateInventory(Number(quantityValue))
		}

		setProcessing(false)
		onClose()
	}

	const uploadImages = (files: File[], targetRef: DocumentReference) => {
		return files.map(file => {
			return uploadImage(file, targetRef)
		})
	}

	const extension = (type: string) => {
		if (type === "image/jpeg") return "jpg"
		if (type === "image/png") return "png"
	}

	const uploadImage = (file: File, targetRef: DocumentReference): Promise<StorageFile | undefined> => {
		const id = firebase.firestore().collection("/dummy").doc().id
		const ref = firebase.storage().ref(targetRef.path + `/images/${id}.${extension(file.type)}`)
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

	return (
		<Container maxWidth="sm" disableGutters>
			<form autoComplete="off" onSubmit={onSubmit}>
				<Paper>
					<Box padding={2}>
						<Typography variant="h1">Add new product.</Typography>
					</Box>
					<Divider />
					<Box padding={2}>
						<Box>
							<Box paddingY={1}>
								<Typography variant="subtitle1">Sales Method</Typography>
								<FormControl variant="outlined" margin="dense" size="small">
									<Select variant="outlined" {...salesMethod}>
										{salesMethodMenu}
									</Select>
								</FormControl>
							</Box>
							<MediaController URLs={[]} isEditing maxCount={MAXIMUM_NUMBER_OF_IMAGES}
								onDrop={(files) => {
									setImages(files)
								}}
								onDeleteImage={async (props) => {

								}}
								onDeleteUploadImage={(props) => {
									const { index } = props
									const _images = images.filter((value, idx) => index !== idx)
									setImages(_images)
								}}
								onError={() => {
									showSnackbar("error", `The maximum number of images is ${MAXIMUM_NUMBER_OF_IMAGES}.`)
								}} />
							<Box paddingY={1}>
								<Typography variant="subtitle1">Name</Typography>
								<TextField variant="outlined" margin="dense" required {...name} fullWidth />
							</Box>
							<Box paddingY={1}>
								<Typography variant="subtitle1">Caption</Typography>
								<TextField variant="outlined" margin="dense" required {...caption} fullWidth />
							</Box>
							<Box paddingY={1}>
								<Typography variant="subtitle1">Price</Typography>
								<FormControl variant="outlined" margin="dense" size="small">
									<Select variant="outlined" {...currency}>
										{currencyMenu}
									</Select>
								</FormControl>
								<TextField variant="outlined" margin="dense" required {...price} style={{
									marginLeft: "8px"
								}} InputProps={{
									startAdornment: <InputAdornment position="start">{Symbol(currency.value as CurrencyCode)}</InputAdornment>
								}} />
							</Box>
							<Box paddingY={1}>
								<Typography variant="subtitle1">Tax rate</Typography>
								<Box display="flex">
									<TextField variant="outlined" margin="dense" required {...taxRate} InputProps={{
										endAdornment: <InputAdornment position="end">%</InputAdornment>
									}} />
								</Box>
							</Box>
							<Box paddingY={1}>
								<Typography variant="subtitle1" gutterBottom>Inventory</Typography>
								<FormControl variant="outlined" margin="dense" size="small">
									<Select variant="outlined" {...inventory} >
										{inventoryMenu}
									</Select>
								</FormControl>
								{inventory.value === "bucket" &&
									<FormControl variant="outlined" margin="dense" size="small" style={{ marginLeft: "8px" }}>
										<Select variant="outlined" {...stockValue}>
											{stockValueMenu}
										</Select>
									</FormControl>
								}
								{inventory.value === "finite" &&
									<TextField variant="outlined" margin="dense" required {...quantity} style={{ marginLeft: "8px" }} error={quantityError} />
								}
							</Box>
						</Box>
					</Box>
					<Box display="flex" padding={2}>
						<Button onClick={onClose} style={{ marginRight: "8px" }}>Cancel</Button>
						<Button fullWidth
							disabled={disabled}
							variant="contained"
							size="large"
							color="primary"
							type="submit">
							Create
						</Button>
					</Box>
				</Paper>
			</form >
		</Container>
	)
}
