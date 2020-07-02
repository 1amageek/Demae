
import React, { useState } from "react"
import firebase from "firebase"
import { File as StorageFile } from "@1amageek/ballcap"
import { Link } from "react-router-dom"
import { Typography, Box, Paper, FormControl, Button, ListItemSecondaryAction } from "@material-ui/core";
import Input, { useInput } from "components/Input"
import { List, ListItem, ListItemText, ListItemAvatar, ListItemIcon, Divider } from "@material-ui/core";
import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ImageIcon from "@material-ui/icons/Image";
import Product, { DeliveryMethod } from "models/commerce/Product"
import DataLoading from "components/DataLoading";
import Board from "../Board";
import DndCard from "components/DndCard"
import SaveIcon from "@material-ui/icons/Save";
import { useHistory } from "react-router-dom";
import { SKU, User } from "models/commerce";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import Select, { useSelect, useMenu } from "components/_Select"
import * as Social from "models/social"
import { useAdminProviderProduct } from "hooks/commerce";
import { useContentToolbar, useEdit } from "components/NavigationContainer"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Label from "components/Label";
import { useDocumentListen, useDataSourceListen, OrderBy } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import { Activity, Comment, ChangeDeliveryStatus } from "models/commerce/Order"
import { useAuthUser } from "hooks/auth";
import { useProcessing } from "components/Processing";
import { Batch } from "@1amageek/ballcap";

Dayjs.extend(relativeTime)

const deliveryMethodLabel: { [key in DeliveryMethod]: string } = {
	"none": "No shipping required",
	"pickup": "Pickup",
	"shipping": "Shipping required"
}

export default () => {
	const theme = useTheme();
	const [auth] = useAuthUser()
	const [product, isLoading] = useAdminProviderProduct()
	const [isEditing, setEdit] = useEdit()
	const [textField] = useTextField()

	useContentToolbar(() => {
		return (
			<Box display="flex" flexGrow={1} justifyContent="flex-end" paddingX={2}>
				<Button variant="outlined" color="primary" size="small" onClick={() => setEdit(true)}>Edit</Button>
			</Box>
		)
	}, [])

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
			height: "100%"
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
						<Avatar variant="square" src={product.imageURLs()[0]} style={{
							minHeight: "200px",
							width: "100%"
						}}>
							<ImageIcon />
						</Avatar>
						<Box paddingTop={2}>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Caption</Typography>
								<Typography variant="body1" gutterBottom>{product.caption}</Typography>
							</Box>
							<Box paddingBottom={2}>
								<Typography variant="subtitle1" gutterBottom>Description</Typography>
								<Typography variant="body1" gutterBottom>{product.description}</Typography>
							</Box>
						</Box>
					</Box>
				</article>
				<Divider />
				<Box paddingY={2}>
					<List>
						<ListItem button component={Link} to={`/admin/products/${product.id}/skus`}>
							<ListItemText primary="SKU" />
						</ListItem>
					</List>
					<Typography variant="body2" gutterBottom>Manage inventory, including different sizes and colors.</Typography>
				</Box>
			</Box>
		</Paper >
	)
}


const Edit = ({ product, onClose }: { product: Product, onClose: () => void }) => {
	const [setProcessing] = useProcessing()
	const [images, setImages] = useState<File[]>([])

	const [name] = useTextField(product.name)
	const [caption] = useTextField(product.caption)
	const [description] = useTextField(product.description)
	const [deliveryMethod, setDeliveryMethod] = useSelect(product.deliveryMethod)
	const [isAvailable, setAvailable] = useSelect(product.isAvailable)
	const deliveryMethodMenu = useMenu([
		{
			label: "No shipping required",
			value: "none"
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
		product.description = description.value as string
		product.deliveryMethod = deliveryMethod.value as DeliveryMethod
		product.isAvailable = (isAvailable.value === "true")
		await product.save()
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

	useContentToolbar(() => {
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={2}>
				<Button variant="outlined" color="primary" size="small" onClick={onClose}>Cancel</Button>
				<Button variant="contained" color="primary" size="small" type="submit"
					startIcon={
						<SaveIcon />
					}
				>Save</Button>
			</Box>
		)
	})

	const updatedAt = Dayjs(product.updatedAt.toDate())
	return (
		<Paper elevation={0} style={{
			height: "100%"
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
						<Avatar variant="square" src={product.imageURLs()[0]} style={{
							minHeight: "200px",
							width: "100%"
						}}>
							<ImageIcon />
						</Avatar>
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
								<Typography variant="subtitle1" gutterBottom>Delivery</Typography>
								<FormControl variant="outlined" size="small">
									<Select variant="outlined" {...deliveryMethod} >
										{deliveryMethodMenu}
									</Select>
								</FormControl>
							</Box>
						</Box>
					</Box>
				</article>
			</Box>
		</Paper >
	)
}
