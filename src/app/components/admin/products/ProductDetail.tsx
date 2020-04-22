
import React, { useState, useRef } from 'react'
import firebase from 'firebase'
import Link from 'next/link'
import { File as StorageFile } from '@1amageek/ballcap'
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
import DndCard from 'components/DndCard'
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Product from 'models/commerce/Product'
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { useProviderProduct } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useProcessing } from 'components/Processing';


export default () => {
	const [product, isLoading] = useProviderProduct()
	const [processing, setProcessing] = useProcessing()
	const [isEditing, setEdit] = useState(false)
	const [images, setImages] = useState<File[]>([])
	const name = useInput(product?.name)
	const caption = useInput(product?.caption)
	const description = useInput(product?.description)
	const isAvailable = useSelect({
		initValue: product?.isAvailable.toString() || 'true',
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

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!product) return
		setProcessing(true)
		const uploadedImages = await Promise.all(uploadImages(images))
		if (uploadedImages) {
			const fileterd = uploadedImages.filter(image => !!image) as StorageFile[]
			product.images = fileterd
		}
		product.name = name.value
		product.caption = caption.value
		product.description = description.value
		product.isAvailable = (isAvailable.value === 'true')
		await product.save()
		setProcessing(false)
		setEdit(false)
	}

	const uploadImages = (files: File[]) => {
		return files.map(file => {
			return uploadImage(file)
		})
	}

	const extension = (type: string) => {
		if (type === 'image/jpeg') return 'jpg'
		if (type === 'image/png') return 'png'
	}

	const uploadImage = (file: File): Promise<StorageFile | undefined> => {
		const id = firebase.firestore().collection('/dummy').doc().id
		const ref = firebase.storage().ref(product!.documentReference.path + `/images/${id}.${extension(file.type)}`)
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
			<Board header={
				<Typography variant='h6'>
					No choise product
				</Typography>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	if (!product) {
		return (
			<Board header={
				<Typography variant='h6'>
					No choise product
				</Typography>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<Typography variant='h6'>No choise product</Typography>
				</Box>
			</Board>
		)
	}

	if (isEditing) {
		return (
			<form onSubmit={onSubmit}>
				<Board header={
					<Box display="flex" flexGrow={1}>
						<Typography variant='h6'>{product.name}</Typography>
						<Box flexGrow={1} />
						<Button
							color="primary"
							onClick={async () => {
								setEdit(false)
							}}
						>Cancel</Button>
						<Button
							variant="contained"
							color="primary"
							type='submit'
							startIcon={
								<SaveIcon />
							}
						>Save</Button>
					</Box>
				}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<DndCard
								defaultText={'Images Image Drop the files here ...'}
								onDrop={(files) => {
									setImages(files)
								}} />
						</Grid>
					</Grid>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell align='right'><div>ID</div></TableCell>
								<TableCell align='left'><div>{product.id}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>name</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' required {...name} />
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
				</Board>
			</form>
		)
	}

	return (
		<Board header={
			<Box display="flex" flexGrow={1}>
				<Typography variant='h6'>{product.name}</Typography>
				<Box flexGrow={1} />
				<Button
					variant="contained"
					color="primary"
					startIcon={
						<EditIcon />
					}
					onClick={async () => {
						setEdit(true)
					}}
				>Edit Product</Button>
			</Box>
		}>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell align='right'><div>ID</div></TableCell>
						<TableCell align='left'><div>{product.id}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>name</div></TableCell>
						<TableCell align='left'><div>{product.name}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>caption</div></TableCell>
						<TableCell align='left'><div>{product.caption}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>description</div></TableCell>
						<TableCell align='left'><div>{product.description}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>Status</div></TableCell>
						<TableCell align='left'><div>{product.isAvailable ? 'Available' : 'Unavailable'}</div></TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Board>
	)
}

