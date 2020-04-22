
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
import ImageIcon from '@material-ui/icons/Image';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { useProviderProducts, useAdminProvider, useUser } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import ISO4217 from 'common/ISO4217'
import { ListItemSecondaryAction, Switch } from '@material-ui/core';


export default ({ productID }: { productID?: string }) => {
	const [provider] = useAdminProvider()
	const [products, isLoading] = useProviderProducts()
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
				<Typography variant='h6'>Product</Typography>
				<Box flexGrow={1} />
				<Button
					variant="contained"
					color="primary"
					startIcon={
						<AddCircleIcon />
					}
					onClick={async () => {
						if (!provider) return
						const product = new Product(provider.products.collectionReference.doc())
						product.providedBy = provider.id
						product.name = "No name"
						product.isAvailable = false
						await product.save()
						history.push(`/admin/products/${product.id}`)
					}}
				>New</Button>
			</Box>
		}>
			<List>
				{products.map(data => {
					return <ProductListItem productID={productID} product={data} />
				})}
			</List>
		</Board>
	)
}

const ProductListItem = ({ productID, product }: { productID?: string, product: Product }) => {
	const [user] = useUser()
	const history = useHistory()
	const price = product.price || {}
	const currency = user?.currency || 'USD'
	const symbol = ISO4217[currency].symbol
	const amount = price[currency]
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined

	return (
		<ListItem key={product.id} button selected={productID === product.id} onClick={() => {
			history.push(`/admin/products/${product.id}`)
		}}>
			<ListItemAvatar>
				<Avatar variant="rounded" src={product.imageURLs()[0]} >
					<ImageIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={product.name} secondary={
				<>
					<Typography>{product.caption}</Typography>
					{amount && <Typography>{`${symbol}${amount}`}</Typography>}
				</>
			} />
			<ListItemSecondaryAction>
				<Switch
					edge="end"
					onChange={async () => {
						product.isAvailable = !product.isAvailable
						await product.save()
					}}
					checked={product.isAvailable}
				/>
			</ListItemSecondaryAction>
		</ListItem>
	)
}
