
import React, { useState, useCallback } from "react"
import firebase from "firebase"
import { File as StorageFile } from "@1amageek/ballcap"
import { useDropzone } from "react-dropzone"
import { Box, Paper, FormControl, Button, Grid, Tooltip, IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import { useTheme } from "@material-ui/core/styles";


interface Props {
	isEditing?: boolean
	URLs: string[]
	maxCount?: number
	onClick?: (props: OnClickProps) => void
	onDrop?: (acceptedFiles) => void
	onError?: (count: number) => void
}

interface OnClickProps {
	index: number
	url: string
}

interface State {
	images: string[]
	uploadImages: string[]
}

function readFileAsync(file: File) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	})
}

export default (props: Props) => {
	const theme = useTheme();
	const { URLs, isEditing, maxCount, onDrop, onClick, onError } = props
	const max = maxCount || 10
	const [state, setState] = useState<State>({ images: URLs, uploadImages: [] })
	const { images, uploadImages } = state
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: "image/jpeg,image/png",
		onDrop: async (acceptedFiles) => {
			const fileCount = acceptedFiles.length + images.length
			if (fileCount > max) {
				if (onError) {
					onError(fileCount)
				}
			} else {
				if (onDrop) {
					onDrop(acceptedFiles)
					const task = (acceptedFiles as File[]).map(file => readFileAsync(file))
					const uploadImages: string[] = await Promise.all(task) as unknown as string[]
					setState({
						...state,
						uploadImages
					})
				}
			}
		}
	})
	return (
		<Grid container spacing={1}>
			{images.map((url, index) => {
				return (
					<Grid item xs={6} sm={4} md={3} key={`image-${index}`}>
						<Paper elevation={1} >
							<Box display="flex" position="relative">
								{isEditing &&
									<Box position="absolute" zIndex="mobileStepper" padding={0.5}>
										<Tooltip title={"Delete the image."}>
											<IconButton size="small" onClick={(e) => {
												e.preventDefault()
												if (onClick) {
													onClick({ index, url })
												}
											}}>
												<CloseIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</Box>
								}
								<Avatar variant="square" src={url} style={{
									height: "100%",
									width: "100%"
								}}>
									<ImageIcon />
								</Avatar>
							</Box>
						</Paper>
					</Grid>
				)
			})}
			{uploadImages.map((url, index) => {
				return (
					<Grid item xs={6} sm={4} md={3} key={`uploadImage-${index}`}>
						<Paper elevation={1} >
							<Box display="flex" position="relative">
								{isEditing &&
									<Box position="absolute" zIndex="mobileStepper" padding={0.5}>
										<Tooltip title={"Delete the image."}>
											<IconButton size="small" onClick={(e) => {
												e.preventDefault()
												const _uploadImages = uploadImages.filter((value, idx) => idx !== index)
												setState({
													...state,
													uploadImages: _uploadImages
												})
											}}>
												<CloseIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</Box>
								}
								<Avatar variant="square" src={url} style={{
									height: "100%",
									width: "100%"
								}}>
									<ImageIcon />
								</Avatar>
							</Box>
						</Paper>
					</Grid>
				)
			})}
			{
				isEditing &&
				<Grid item xs={6} sm={3}>
					<Paper elevation={isDragActive ? 6 : 1} style={{
						width: "100%",
						height: "100%",
						background: "rgba(0, 0, 0, 0.1)",
						aspectRatio: "1 / 1"
					}}>
						<Box
							display="flex"
							justifyContent="center"
							alignItems="center"
							flexDirection="column"
							width="100%"
							height="100%"
							minHeight="80px"
							borderColor="primary.light"
							borderRadius={6}
							border={isDragActive ? 2 : 0}
							{...getRootProps()}
							style={{
								borderColor: theme.palette.primary.light
							}} p
						>
							<input {...getInputProps()} />
							<Tooltip title={"Click to upload"}>
								<IconButton>
									<AddPhotoAlternateIcon style={{ color: "#fff" }} />
								</IconButton>
							</Tooltip>
							<Typography variant="subtitle2" color="textSecondary">Add an image</Typography>
						</Box>
					</Paper>
				</Grid>
			}
		</Grid >
	)
}
