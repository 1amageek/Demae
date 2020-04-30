
import React, { useState } from 'react'
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
import { ListItemSecondaryAction, Switch } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useAdminProviderProductSKUs, useAdminProvider } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { SKU } from 'models/commerce';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import ISO4217 from 'common/ISO4217'

export default ({ productID }: { productID?: string }) => {
	const [provider] = useAdminProvider()
	const [skus, isLoading] = useAdminProviderProductSKUs(productID)
	const history = useHistory()
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	if (isLoading) {
		return (
			<Board header={
				<Box display="flex" flexGrow={1}>
					<Typography variant='h6'>Product</Typography>
					<Box flexGrow={1} />
				</Box>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	return (
		<Board header={
			<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500}>
				SKU
				<Box flexGrow={1} />
				<Button
					variant="contained"
					color="primary"
					startIcon={
						<AddCircleIcon />
					}
					onClick={async () => {
						if (!provider) return
						if (!productID) return
						const sku = new SKU(provider.products.collectionReference.doc(productID).collection('skus').doc())
						sku.providedBy = provider.id
						sku.name = "No name"
						sku.isAvailable = false
						await sku.save()
						history.push(`/admin/products/${productID}/skus/${sku.id}`)
					}}
				>New</Button>
			</Box>
		}>
			<List>
				{skus.map(data => {
					const price = data.price
					const currency = data.currency
					const symbol = ISO4217[currency].symbol
					return (
						<ListItem key={data.id} button selected={productID === data.id} onClick={() => {
							history.push(`/admin/products/${productID}/skus/${data.id}`)
						}}>
							<ListItemAvatar>
								<Avatar variant="rounded" src={data.imageURLs()[0]} >
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={data.name} secondary={`${symbol}${price.toLocaleString()}`} />
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									onChange={async (e) => {
										e.preventDefault()
										setProcessing(true)
										data.isAvailable = !data.isAvailable
										await data.save()
										setProcessing(false)
										setMessage('success', `${data.name} is published`)
									}}
									checked={data.isAvailable}
								/>
							</ListItemSecondaryAction>
						</ListItem>
					)
				})}
			</List>
		</Board>
	)
}

