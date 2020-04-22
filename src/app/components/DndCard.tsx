import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Avatar, Box } from '@material-ui/core';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import ImageIcon from '@material-ui/icons/Image';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
	createStyles({
		box: {
			background: 'rgba(0, 0, 0, 0.2)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},
		innerBox: {
			flexGrow: 1,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			border: '2px solid #fff'
		}
	})
)

export default ({ url, onDrop }: { url?: string, onDrop: (acceptedFiles: File[]) => void }) => {
	const classes = useStyles()
	const [image, setImage] = useState(url)
	const callback = useCallback(acceptedFiles => {
		onDrop(acceptedFiles)

		const file = acceptedFiles[0] as File
		const reader = new FileReader()
		reader.onloadend = (event) => {
			if (event.currentTarget) {
				setImage((event.currentTarget as any).result)
			}
		}
		reader.readAsDataURL(file)

	}, [])
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: 'image/jpeg,image/png', onDrop: callback })

	return (

		<Box position='relative'>
			<Box className={classes.box}
				zIndex='modal'
				position="absolute"
				width="100%"
				height="100%"
				padding={4}
				{...getRootProps()}>
				<Box className={classes.innerBox}
					width="100%"
					height="100%"
					borderRadius={8}
				>
					<input {...getInputProps()} />
					{!isDragActive && <AddPhotoAlternateIcon style={{ color: '#fff' }} />}
				</Box>
			</Box>
			<Box>
				<Avatar variant="square" src={image} style={{
					minHeight: '200px',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
		</Box>

	)
}
