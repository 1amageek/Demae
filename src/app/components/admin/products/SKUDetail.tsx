
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
import { CurrencyCode, CurrencyCodes } from 'common/Currency'
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { useProviderProduct, useProviderProductSKU } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useProcessing } from 'components/Processing';
import { StockType, StockValue } from 'common/commerce/Types';

export default ({ productID, skuID }: { productID?: string, skuID?: string }) => {

	const [product] = useProviderProduct()
	const [sku, isLoading] = useProviderProductSKU(productID, skuID)
	const [processing, setProcessing] = useProcessing()
	const [isEditing, setEdit] = useState(false)


	const [images, setImages] = useState<File[]>([])
	const name = useInput(sku?.name)
	const caption = useInput(sku?.caption)
	const amount = useInput(sku?.amount)
	const description = useInput(sku?.description)
	const currency = useSelect({
		initValue: sku?.currency, inputProps: {
			menu: CurrencyCodes.map(c => {
				return {
					label: c,
					value: c,
				}
			})
		}
	})
	const inventory = useSelect({
		initValue: sku?.inventory.type, inputProps: {
			menu: [
				{
					label: 'Bucket',
					value: 'bucket'
				},
				{
					label: 'Finite',
					value: 'finite'
				}
				, {
					label: 'Infinite',
					value: 'infinite'
				}
			]
		}
	})
	const quantity = useInput(sku?.inventory.quantity || '0')
	const stockValue = useSelect({
		initValue: sku?.inventory.value || 'in_stock',
		inputProps: {
			menu: [
				{
					label: 'In Stock',
					value: 'in_stock'
				},
				{
					label: 'Limited',
					value: 'limited'
				}
				, {
					label: 'Out Of Stock',
					value: 'out_of_stock'
				}
			]
		}
	})
	const isAvailable = useSelect({
		initValue: sku?.isAvailable || 'true',
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
		if (!sku) return
		setProcessing(true)
		const uploadedImages = await Promise.all(uploadImages(images))
		if (uploadedImages) {
			const fileterd = uploadedImages.filter(image => !!image) as StorageFile[]
			sku.images = fileterd
		}
		sku.name = name.value
		sku.caption = caption.value
		sku.description = description.value
		sku.amount = Number(amount.value)
		sku.currency = currency.value as CurrencyCode
		sku.inventory = {
			type: inventory.value as StockType,
			value: stockValue.value as StockValue,
			quantity: Number(quantity.value)
		}
		sku.isAvailable = isAvailable.value === 'true'

		const price = product.price || {}
		var productAmount = price[sku.currency] || Infinity
		productAmount = Math.min(productAmount, sku.amount)
		productAmount = Math.max(productAmount, 0)
		product.price = {
			...price,
			[sku.currency]: productAmount
		}
		await Promise.all([sku.save(), product.update()])
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

	if (!sku) {
		return (
			<Board header={
				<Typography variant='h6'>
					No choise sku
				</Typography>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<Typography variant='h6'>No choise sku</Typography>
				</Box>
			</Board>
		)
	}

	if (isEditing) {
		return (
			<form onSubmit={onSubmit}>
				<Board header={
					<Box display="flex" flexGrow={1}>
						<Typography variant='h6'>{sku.name}</Typography>
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
								<TableCell align='left'><div>{sku.id}</div></TableCell>
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
								<TableCell align='right'><div>amount</div></TableCell>
								<TableCell align='left'>
									<div>
										<Select {...currency} />
										<Input variant='outlined' margin='dense' type='number' style={{ width: '112px', marginLeft: '8px' }} value={amount.value} onChange={e => {
											const newAmount = Math.floor(Number(e.target.value) * 100) / 100
											amount.setValue(`${newAmount}`)
										}} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>inventory</div></TableCell>
								<TableCell align='left'>
									<div>
										<Select {...inventory} />
										{inventory.value === 'bucket' && <Select style={{ marginLeft: '8px' }} {...stockValue} />}
										{inventory.value === 'finite' && <Input variant='outlined' margin='dense' style={{ width: '112px', marginLeft: '8px' }} type='number' value={quantity.value} onChange={e => {
											const newQuantity = Math.floor(Number(e.target.value))
											quantity.setValue(`${newQuantity}`)
										}} />}
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
				<Typography variant='h6'>{sku.name}</Typography>
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
				>Edit SKU</Button>
			</Box>
		}>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell align='right'><div>ID</div></TableCell>
						<TableCell align='left'><div>{sku.id}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>name</div></TableCell>
						<TableCell align='left'><div>{sku.name}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>caption</div></TableCell>
						<TableCell align='left'><div>{sku.caption}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>description</div></TableCell>
						<TableCell align='left'><div>{sku.description}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>price</div></TableCell>
						<TableCell align='left'><div>{sku.currency} {sku.amount}</div></TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>inventory</div></TableCell>
						<TableCell align='left'>
							<div>
								{sku.inventory.type === 'infinite' && 'Infinite'}
								{sku.inventory.type === 'bucket' && sku.inventory.value}
								{sku.inventory.type === 'finite' && sku.inventory.quantity}
							</div>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell align='right'><div>Status</div></TableCell>
						<TableCell align='left'><div>{sku.isAvailable ? 'Available' : 'Disabled'}</div></TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Board>
	)
}

