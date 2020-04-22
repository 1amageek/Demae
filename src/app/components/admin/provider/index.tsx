
import React, { useState } from 'react'
import firebase from 'firebase'
import { File as StorageFile } from '@1amageek/ballcap'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import DndCard from 'components/DndCard'
import Provider from 'models/commerce/Provider'
import Loading from 'components/Loading';
import Board from 'components/admin/Board'
import { useAdminProvider } from 'hooks/commerce';
import { useProcessing } from 'components/Processing';
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
	const classes = useStyles()
	const [provider, isLoading, error] = useAdminProvider()
	const [processing, setProcessing] = useProcessing()
	const [thumbnail, setThumbnail] = useState<File | undefined>()
	const [cover, setCover] = useState<File | undefined>()
	const name = useInput(provider?.name)
	const caption = useInput(provider?.caption)
	const description = useInput(provider?.description)
	const isAvailable = useSelect({
		initValue: provider?.isAvailable || 'true',
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

	console.log(error)

	const uploadThumbnail = (file: File): Promise<StorageFile | undefined> => {
		const ref = firebase.storage().ref(provider!.documentReference.path + '/thumbnail.jpg')
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
		const ref = firebase.storage().ref(provider!.documentReference.path + '/cover.jpg')
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

	if (isLoading) {
		return (
			<Board>
				<DataLoading />
			</Board>
		)
	}

	return (
		<>
			<Board>
				<Box className={classes.box} >
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<DndCard
								onDrop={(files) => {
									const file = files[0] as File
									setThumbnail(file)
								}} />
						</Grid>
						<Grid item xs={12} sm={6}>
							<DndCard
								onDrop={(files) => {
									const file = files[0] as File
									setCover(file)
								}} />
						</Grid>
					</Grid>
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
								}
								}>SAVE</Button>
							</Grid>
						</Grid>
					</Toolbar>
				</Box>
			</Board>
		</>
	)
}
