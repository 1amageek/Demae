import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Avatar, Box, Tooltip, IconButton, BoxProps } from '@material-ui/core';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import ImageIcon from '@material-ui/icons/Image';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
	createStyles({
		box: {
			background: 'rgba(0, 0, 0, 0.18)',
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

interface DnDProps {
	url?: string
	title?: string
	onDrop: (acceptedFiles) => void
}

export default (props: DnDProps) => {
	const classes = useStyles()
	const { url, onDrop, title } = props
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
		<Box
			position='relative'
			display='flex'
			flexGrow={1}
			width="100%"
			top={0}
			bottom={0}
			{...props}
		>
			<Box className={classes.box}
				zIndex={1050}
				position="absolute"
				width="100%"
				height="100%"
				{...getRootProps()}
			>
				<input {...getInputProps()} />
				<Tooltip title={'Click to upload'}>
					<IconButton>
						<AddPhotoAlternateIcon style={{ color: '#fff' }} />
					</IconButton>
				</Tooltip>
			</Box>
			<Box
				width="100%"
				height="100%"
			>
				<Avatar variant="square" src={image} style={{
					minHeight: '64px',
					height: '100%',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
		</Box>

	)
}
