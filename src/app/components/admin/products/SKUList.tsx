
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

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useProviderProductSKUs, useAdminProvider } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { SKU } from 'models/commerce';


export default ({ productID }: { productID?: string }) => {
	const [provider] = useAdminProvider()
	const [skus, isLoading] = useProviderProductSKUs(productID)
	const history = useHistory()

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
			<Box display="flex" flexGrow={1}>
				<Typography variant='h6'>SKU</Typography>
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
				>New SKU</Button>
			</Box>
		}>
			<List>
				{skus.map(data => {
					return (
						<ListItem key={data.id} button selected={productID === data.id} onClick={() => {
							history.push(`/admin/products/${productID}/skus/${data.id}`)
						}}>
							<ListItemAvatar>
								<Avatar>
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={data.name} secondary={data.caption} />
						</ListItem>
					)
				})}
			</List>
		</Board>
	)
}

