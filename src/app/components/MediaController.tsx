
import React, { useState, useCallback } from "react"
import firebase from "firebase"
import { File as StorageFile } from "@1amageek/ballcap"
import { useDropzone } from "react-dropzone"
import { Box, Paper, FormControl, Button, Grid, Tooltip, IconButton } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import { useTheme } from "@material-ui/core/styles";


interface Props {
	URLs: string[]
	onClick: (props: OnClickProps) => void
	onDrop: (acceptedFiles) => void
}

interface OnClickProps {
	index: number
	url: string
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
	const { URLs, onDrop, onClick } = props
	const [images, setImages] = useState<string[]>(URLs)
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: "image/jpeg,image/png", onDrop: async (acceptedFiles) => {
			onDrop(acceptedFiles)
			const task = (acceptedFiles as File[]).map(file => readFileAsync(file))
			const result: string[] = await Promise.all(task) as unknown as string[]
			setImages([...images, ...result])
		}
	})
	return (
		<Grid container spacing={1}>
			{images.map((url, index) => {
				return (
					<Grid item xs={3} key={index}>
						<Paper elevation={1} >
							<Box display="flex" position="relative">
								<Box position="absolute" zIndex="mobileStepper" padding={0.5}>
									<Tooltip title={"Delete the image."}>
										<IconButton size="small" onClick={(e) => {
											e.preventDefault()
											onClick({ index, url })
										}}>
											<CloseIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								</Box>
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
			<Grid item xs={3}>
				<Paper elevation={1} style={{
					width: "100%",
					height: "100%",
					background: "rgba(0, 0, 0, 0.2)",
					aspectRatio: "1 / 1"
				}}>
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						width="100%"
						height="100%"
						{...getRootProps()}
					>

						<input {...getInputProps()} />
						<Tooltip title={"Click to upload"}>
							<IconButton>
								<AddPhotoAlternateIcon style={{ color: "#fff" }} />
							</IconButton>
						</Tooltip>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	)
}
