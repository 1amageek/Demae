
import React, { useState } from "react"
import firebase from "firebase"
import { File as StorageFile } from "@1amageek/ballcap"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import { Container, Grid, Button, Table, TableRow, TableCell, TableBody, Divider, Box, Typography } from "@material-ui/core";
import TextField, { useTextField } from "components/TextField"
import Switch, { useSwitch } from "components/Switch";
import DndCard from "components/DndCard"
import Provider from "models/commerce/Provider"
import Board from "components/admin/Board"
import { useAdminProvider } from "hooks/commerce";
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar";
import { useContentToolbar, useEdit, NavigationBackButton } from "components/NavigationContainer"
import DataLoading from "components/DataLoading";


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			backgroundColor: "#fafafa"
		},
		bottomBox: {
			padding: theme.spacing(1),
			display: "flex",
			justifyContent: "flex-end"
		},
		input: {
			backgroundColor: "#fff"
		},
		cell: {
			borderBottom: "none",
			padding: theme.spacing(1),
		},
		cellStatus: {
			borderBottom: "none",
			padding: theme.spacing(1),
			width: "48px",
		},
		cellStatusBox: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		}
	}),
);


export default () => {
	const [provider, isLoading] = useAdminProvider()

	if (isLoading || !provider) {
		return (
			<Container maxWidth="sm">
				<Box padding={2}>
					<Typography variant="h1" gutterBottom>Shop</Typography>
				</Box>
				<DataLoading />
			</Container>
		)
	}

	return <Form provider={provider} />
}

const Form = ({ provider }: { provider: Provider }) => {
	const classes = useStyles()
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()
	const [thumbnail, setThumbnail] = useState<File | undefined>()
	const [cover, setCover] = useState<File | undefined>()
	const [name] = useTextField(provider.name)
	const [caption] = useTextField(provider.caption)
	const [description] = useTextField(provider.description)
	const [isAvailable, setAvailable] = useSwitch(provider.isAvailable)

	const uploadThumbnail = (file: File): Promise<StorageFile | undefined> => {
		const ref = firebase.storage().ref(provider.documentReference.path + "/thumbnail.jpg")
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

	const uploadCover = (file: File): Promise<StorageFile | undefined> => {
		const ref = firebase.storage().ref(provider.documentReference.path + "/cover.jpg")
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

	const [isEditing, setEdit] = useEdit(async (event) => {
		event.preventDefault()
		if (!provider) return
		setProcessing(true)
		if (thumbnail) {
			const thumbnailImage = await uploadThumbnail(thumbnail)
			if (thumbnailImage) {
				provider.thumbnailImage = thumbnailImage
			}
		}
		if (cover) {
			const coverImage = await uploadCover(cover)
			if (coverImage) {
				provider.coverImage = coverImage
			}
		}
		try {
			provider.name = name.value as string
			provider.caption = caption.value as string
			provider.description = description.value as string
			provider.isAvailable = isAvailable.value as boolean
			await provider.save()
		} catch (error) {
			console.log(error)
		}
		setProcessing(false)
		setMessage("success", "Change your provider informations.")
		setEdit(false)
	})

	useContentToolbar(() => {
		if (!provider) return <></>
		if (isEditing) {
			return (
				<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
					<Button variant="outlined" color="primary" size="small" onClick={() => setEdit(false)}>Cancel</Button>
					<Button variant="contained" color="primary" size="small" type="submit"
					>Save</Button>
				</Box>
			)
		}
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
				<Box>
					<NavigationBackButton title="Products" href="/admin/products" />
				</Box>
				<Box display="flex" flexGrow={1} justifyContent="flex-end">
					<Button variant="outlined" color="primary" size="small" onClick={() => setEdit(true)}>Edit</Button>
				</Box>
			</Box>
		)
	})

	if (isEditing) {
		return (
			<Container maxWidth="sm">
				<Box padding={2}>
					<Typography variant="h1" gutterBottom>Shop</Typography>
					<Box className={classes.box} >
						<Box display="flex" position="relative" flexGrow={1}>
							<Box display="flex" flexGrow={1} height={300}>
								<DndCard
									url={provider?.coverImageURL()}
									onDrop={(files) => {
										const file = files[0] as File
										setCover(file)
									}} />
							</Box>
							<Box display="flex" position="absolute" zIndex={1050} flexGrow={1} width={120} height={120} border={2} borderColor="white" borderRadius="50%" bottom={-16} left={16} style={{ overflow: "hidden" }}>
								<DndCard
									url={provider?.thumbnailImageURL()}
									onDrop={(files) => {
										const file = files[0] as File
										setThumbnail(file)
									}} />
							</Box>
						</Box>
						<Box padding={2}>
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
						</Box>
					</Box>
					<Box padding={1}>
						<Typography variant="body2" color="textSecondary" gutterBottom>ID: {provider.id}</Typography>
					</Box>
				</Box>
			</Container>
		)
	}

	return (
		<Container maxWidth="sm">
			<Box padding={2}>
				<Typography variant="h1" gutterBottom>Shop</Typography>
				<Box className={classes.box} >
					<Box display="flex" position="relative" flexGrow={1}>
						<Box display="flex" flexGrow={1} height={300}>
							<Avatar variant="square" src={provider.coverImageURL()} style={{
								minHeight: "300px",
								width: "100%"
							}}>
								<ImageIcon />
							</Avatar>
						</Box>
						<Box display="flex" position="absolute" zIndex={1050} flexGrow={1} width={120} height={120} border={2} borderColor="white" borderRadius="50%" bottom={-16} left={16} style={{ overflow: "hidden" }}>
							<Avatar variant="square" src={provider.thumbnailImageURL()} style={{
								minHeight: "64px",
								height: "100%",
								width: "100%"
							}}>
								<ImageIcon />
							</Avatar>
						</Box>
					</Box>
					<Box padding={2}>
						<Box paddingBottom={2}>
							<Typography variant="subtitle1" gutterBottom>Name</Typography>
							<Typography variant="body1" gutterBottom>{provider.name}</Typography>
						</Box>
						<Box paddingBottom={2}>
							<Typography variant="subtitle1" gutterBottom>Caption</Typography>
							<Typography variant="body1" gutterBottom>{provider.caption}</Typography>
						</Box>
						<Box paddingBottom={2}>
							<Typography variant="subtitle1" gutterBottom>Description</Typography>
							<Typography variant="body1" gutterBottom>{provider.description}</Typography>
						</Box>
					</Box>
				</Box>
				<Box padding={1}>
					<Typography variant="body2" color="textSecondary" gutterBottom>ID: {provider.id}</Typography>
				</Box>
			</Box>
		</Container>
	)
}
