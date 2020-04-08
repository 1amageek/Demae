import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(1, 2),
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},
		innerBox: {
			flexGrow: 1,
			backgroundColor: '#fff',
			padding: theme.spacing(3),
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	})
)

export default ({ onDrop, defaultText }: { defaultText: string, onDrop: (acceptedFiles: File[]) => void }) => {
	const classes = useStyles()
	const callback = useCallback(acceptedFiles => {
		onDrop(acceptedFiles)
	}, [])
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: 'image/jpeg,image/png', onDrop: callback })

	return (
		<Box className={classes.box}>
			<Box
				border={1}
				borderRadius={16}
				borderColor="grey.500"
				className={classes.innerBox}
				{...getRootProps()}>
				<div>
					<input {...getInputProps()} />
					{
						isDragActive ?
							<Typography>aa</Typography> :
							<Typography>{defaultText}</Typography>
					}
				</div>
			</Box>
		</Box>
	)
}
