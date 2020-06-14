
import React, { useState } from 'react'
import firebase from 'firebase'
import { File as StorageFile } from '@1amageek/ballcap'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import { Container, Grid, Button, Table, TableRow, TableCell, TableBody, Divider, Box } from '@material-ui/core';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import DndCard from 'components/DndCard'
import Provider from 'models/commerce/Provider'
import Board from 'components/admin/Board'
import { useAdminProvider } from 'hooks/commerce';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import DataLoading from 'components/DataLoading';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			backgroundColor: '#fafafa'
		},
		bottomBox: {
			padding: theme.spacing(1),
			display: 'flex',
			justifyContent: 'flex-end'
		},
		input: {
			backgroundColor: '#fff'
		},
		cell: {
			borderBottom: 'none',
			padding: theme.spacing(1),
		},
		cellStatus: {
			borderBottom: 'none',
			padding: theme.spacing(1),
			width: '48px',
		},
		cellStatusBox: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	}),
);


export default () => {
	const [provider, isLoading] = useAdminProvider()
	if (isLoading || !provider) {
		return (
			<Container maxWidth='sm'>
				<Board>
					<DataLoading />
				</Board>
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
	const name = useInput(provider.name)
	const caption = useInput(provider.caption)
	const description = useInput(provider.description)
	const isAvailable = useSelect({
		initValue: provider.isAvailable || 'false',
		inputProps: {
			menu: [
				{
					label: 'Available',
					value: 'true'
				},
				{
					label: 'Unavailable',
					value: 'false'
				}
			]
		}
	})

	const uploadThumbnail = (file: File): Promise<StorageFile | undefined> => {
		const ref = firebase.storage().ref(provider.documentReference.path + '/thumbnail.jpg')
		return new Promise((resolve, reject) => {
			ref.put(file).then(async (snapshot) => {
				if (snapshot.state === 'success') {
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
		const ref = firebase.storage().ref(provider.documentReference.path + '/cover.jpg')
		return new Promise((resolve, reject) => {
			ref.put(file).then(async (snapshot) => {
				if (snapshot.state === 'success') {
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
		<Container maxWidth='sm'>
			<Board header={
				<Box>Edit your shop</Box>
			}>
				<Box className={classes.box} >
					<Box display='flex' position='relative' flexGrow={1}>
						<Box display='flex' flexGrow={1} height={300}>
							<DndCard
								url={provider?.coverImageURL()}
								onDrop={(files) => {
									const file = files[0] as File
									setCover(file)
								}} />
						</Box>
						<Box display='flex' position='absolute' zIndex={1050} flexGrow={1} width={120} height={120} border={2} borderColor='white' borderRadius='50%' bottom={-16} left={16} style={{ overflow: 'hidden' }}>
							<DndCard
								url={provider?.thumbnailImageURL()}
								onDrop={(files) => {
									const file = files[0] as File
									setThumbnail(file)
								}} />
						</Box>
					</Box>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell align='right'><div>ID</div></TableCell>
								<TableCell align='left'><div>{provider!.id}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>name</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...name} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>caption</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...caption} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>description</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...description} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>Status</div></TableCell>
								<TableCell align='left'>
									<div>
										<Select fullWidth {...isAvailable} />
									</div>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Toolbar>
						<Grid container spacing={2} alignItems='center'>
							<Grid item>
								<Button variant='contained' color='primary' onClick={async () => {
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
										provider.name = name.value
										provider.caption = caption.value
										provider.description = description.value
										provider.isAvailable = isAvailable.value === 'true'
										await provider.save()
									} catch (error) {
										console.log(error)
									}
									setProcessing(false)
									setMessage('success', 'Change your provider informations.')
								}
								}>SAVE</Button>
							</Grid>
						</Grid>
					</Toolbar>
				</Box>
			</Board>
		</Container>
	)
}
