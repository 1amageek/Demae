
import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Product from 'models/commerce/Product'
import { Symbol } from 'common/Currency'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { useAdminProviderProducts, useAdminProvider, useUser } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { ListItemSecondaryAction, Switch } from '@material-ui/core';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';


export default ({ productID }: { productID?: string }) => {
	const [provider] = useAdminProvider()
	const [products, isLoading] = useAdminProviderProducts()
	const history = useHistory()

	if (isLoading) {
		return (
			<Board hideBackArrow header={
				<>
					<Box fontSize={16} fontWeight={600}>Product</Box>
					<Box flexGrow={1} />
				</>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	return (
		<Board hideBackArrow header={
			<>
				<Box fontSize={16} fontWeight={600}>Product</Box>
				<Box flexGrow={1} />
				<Button
					variant="contained"
					color="primary"
					startIcon={
						<AddCircleIcon />
					}
					onClick={async () => {
						console.log(provider)
						if (!provider) return
						const product = new Product(provider.products.collectionReference.doc())
						product.providedBy = provider.id
						product.name = "No name"
						product.isAvailable = false
						await product.save()
						history.push(`/admin/products/${product.id}`)
					}}
				>New</Button>
			</>
		}>
			<List>
				{products.map(data => {
					return (
						<ListItem key={data.id} button selected={productID === data.id} onClick={() => {
							history.push(`/admin/products/${data.id}`)
						}}>
							<ProductListItem key={data.id} productID={productID} product={data} />
						</ListItem>
					)
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
	const symbol = Symbol(currency)
	const amount = price[currency] || 0
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined
	const priceWithSymbol = amount > 0 ? `${symbol}${amount}` : ''
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	return (
		<>
			<ListItemAvatar>
				<Avatar variant="rounded" src={imageURL} >
					<ImageIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText primary={product.name} secondary={priceWithSymbol} />
			<ListItemSecondaryAction>
				<Switch
					edge="end"
					onChange={async (e) => {
						e.preventDefault()
						setProcessing(true)
						const snapshot = await product.skus.collectionReference.where('isAvailable', '==', true).get()
						if (snapshot.empty) {
							setProcessing(false)
							setMessage('error', `To publish ${product.name}, add the available SKUs.`)
						} else {
							product.isAvailable = !product.isAvailable
							await product.save()
							setProcessing(false)
							setMessage('success', `${product.name} is published`)
						}
					}}
					checked={product.isAvailable}
				/>
			</ListItemSecondaryAction>
		</>
	)
}
