import React, { useState, useRef } from 'react'
import firebase from 'firebase'
import Link from 'next/link'
import { File as StorageFile } from '@1amageek/ballcap'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { Avatar, Box } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import DndCard from 'components/DndCard'
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import { CurrencyCode, CurrencyCodes } from 'common/Currency'
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { useAdminProviderProduct, useAdminProviderProductSKU } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useProcessing } from 'components/Processing';
import { StockType, StockValue } from 'common/commerce/Types';
import { SKU, Product } from 'models/commerce';
import { useDataSourceListen } from 'hooks/firestore';
import { Stock } from 'models/commerce/SKU';
import StockDetail from './StockDetail';

export default ({ productID, skuID }: { productID?: string, skuID?: string }) => {

	const [product] = useAdminProviderProduct()
	const [sku, isLoading] = useAdminProviderProductSKU(productID, skuID)
	const [isEditing, setEdit] = useState(false)


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

	if (!sku || !product) {
		return (
			<Board header={
				<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500}>
					Not selected
				</Box>
			}>
				<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500} padding={8}>
					Not selected
				</Box>
			</Board>
		)
	}

	if (isEditing) {
		return <Edit product={product} sku={sku} onClose={() => {
			setEdit(false)
		}} />
	}

	return (
		<>
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
					>Edit</Button>
				</Box>
			}>
				<Avatar variant="square" src={sku.imageURLs()[0]} style={{
					minHeight: '200px',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
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
							<TableCell align='left'><div>{sku.currency} {sku.price}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='right'><div>Status</div></TableCell>
							<TableCell align='left'><div>{sku.isAvailable ? 'Available' : 'Disabled'}</div></TableCell>
						</TableRow>
						{sku.inventory.type !== 'finite' &&
							<TableRow>
								<TableCell align='right'><div>inventory</div></TableCell>
								<TableCell align='left'>
									<div>
										{sku.inventory.type === 'infinite' && 'Infinite'}
										{sku.inventory.type === 'bucket' && sku.inventory.value}
										{/* {sku.inventory.type === 'finite' && sku.inventory.quantity} */}
									</div>
								</TableCell>
							</TableRow>
						}
					</TableBody>
				</Table>
			</Board>
			{sku.inventory.type === 'finite' && <StockDetail sku={sku} />}
		</>
	)
}


const Edit = ({ product, sku, onClose }: { product: Product, sku: SKU, onClose: () => void }) => {

	const [setProcessing] = useProcessing()
	const [images, setImages] = useState<File[]>([])
	const name = useInput(sku?.name)
	const caption = useInput(sku?.caption)
	const price = useInput(sku?.price)
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
		initValue: sku?.isAvailable.toString() || 'true',
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
		sku.price = Number(price.value)
		sku.currency = currency.value as CurrencyCode
		sku.inventory = {
			type: inventory.value as StockType,
			value: stockValue.value as StockValue,
			quantity: Number(quantity.value)
		}
		sku.productReference = product.documentReference
		sku.isAvailable = isAvailable.value === 'true'

		const nowPrice = product.price || {}
		var productPrice = nowPrice[sku.currency] || Infinity
		productPrice = Math.min(productPrice, sku.price)
		productPrice = Math.max(productPrice, 0)
		product.price = {
			...nowPrice,
			[sku.currency]: productPrice
		}
		await Promise.all([sku.save(), product.update()])
		setProcessing(false)
		onClose()
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

	return (
		<>
			<form onSubmit={onSubmit}>
				<Board header={
					<Box display="flex" flexGrow={1}>
						{sku.name}
						<Box flexGrow={1} />
						<Button
							color="primary"
							onClick={async () => {
								onClose()
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
					<DndCard
						url={sku.imageURLs()[0]}
						onDrop={(files) => {
							setImages(files)
						}} />
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
								<TableCell align='right'><div>amount</div></TableCell>
								<TableCell align='left'>
									<div>
										<Select {...currency} />
										<Input variant='outlined' margin='dense' type='number' style={{ width: '110px', marginLeft: '8px' }} value={price.value} onChange={e => {
											const newPrice = Math.floor(Number(e.target.value) * 100) / 100
											price.setValue(`${newPrice}`)
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
										{/* {inventory.value === 'finite' && <Input variant='outlined' margin='dense' style={{ width: '110px', marginLeft: '8px' }} type='number' value={quantity.value} onChange={e => {
											const newQuantity = Math.floor(Number(e.target.value))
											quantity.setValue(`${newQuantity}`)
										}} />} */}
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
			{sku.inventory.type === 'finite' && <StockDetail sku={sku} />}
		</>
	)
}

