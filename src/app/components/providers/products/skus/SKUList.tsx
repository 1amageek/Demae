import React, { useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import { Box, Paper, Typography, Tooltip, IconButton, ListItemAvatar, Avatar, Button } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import DataLoading from 'components/DataLoading';
import { useDataSourceListen, useDocumentListen, Where } from 'hooks/firestore';
import { Provider, Product, SKU } from 'models/commerce';
import { useCart, useUser } from 'hooks/commerce'
import Cart from 'models/commerce/Cart';
import NotFound from 'components/NotFound'
import Login from 'components/Login'
import { useDialog } from 'components/Dialog'
import { useModal } from 'components/Modal';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			width: '100%'
		},
		avater: {
			width: theme.spacing(12),
			height: theme.spacing(12),
		}
	}),
);

export default ({ providerID, productID }: { providerID: string, productID: string }) => {

	const ref = new Provider(providerID)
		.products.doc(productID, Product)
		.skus
		.collectionReference

	const [skus, isSKULoading] = useDataSourceListen<SKU>(SKU, { path: ref.path, wheres: [Where('isAvailable', '==', true)], limit: 100 })
	const [product, isProductLoading] = useDocumentListen<Product>(Product, new Provider(providerID).products.collectionReference.doc(productID))

	if (isProductLoading || isSKULoading) {
		return (
			<DataLoading />
		)
	}

	if (!product) {
		return <NotFound />
	}

	return (
		<Paper elevation={0}>
			<List dense>
				{skus.map(sku => {
					return (
						<SKUListItem key={sku.id} providerID={providerID} product={product} sku={sku} />
					)
				})}
			</List>
		</Paper>
	)
}

const SKUListItem = ({ providerID, product, sku }: { providerID: string, product: Product, sku: SKU }) => {
	const classes = useStyles()
	const [user] = useUser()
	const [cart] = useCart()
	const [setDialog] = useDialog()
	const [setModal, modalClose] = useModal()

	const imageURL = (sku.imageURLs().length > 0) ? sku.imageURLs()[0] : undefined
	const amount = sku.price || 0
	const price = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: sku.currency }).format(amount)

	const withLogin = async (sku: SKU, onNext: (sku: SKU) => void) => {
		if (user) {
			onNext(sku)
		} else {
			setDialog('Please Login', undefined, [
				{
					title: 'Cancel',
				},
				{
					title: 'OK',
					variant: 'contained',
					color: 'primary',
					handler: () => {
						setModal(<Login onNext={async (user) => {
							onNext(sku)
							modalClose()
						}} />)
					}
				}
			])
		}
	}

	const addSKU = async (sku: SKU) => {
		withLogin(sku, async (sku) => {
			if (!product) return
			if (user) {
				if (cart) {
					cart.addSKU(product, sku)
					await cart.save()
				} else {
					const cart = new Cart(user.id)
					cart.addSKU(product, sku)
					await cart.save()
				}
			}
		})
	}

	const deleteSKU = async (sku: SKU) => {
		if (!cart) { return }
		cart.deleteSKU(sku)
		await cart.save()
	}

	return (
		<ListItem button component={Link} to={`/providers/${providerID}/products/${product.id}/skus/${sku.id}`}>
			<ListItemAvatar>
				<Avatar className={classes.avater} variant="rounded" src={imageURL} alt={sku.name}>
					<ImageIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary={
					<>
						<Box mx={2} my={0} >
							<Box fontSize={16} fontWeight={800}>
								{sku.name}
							</Box>
							<Box>
								{price}
							</Box>
							<Box color='text.secondary'>
								{sku.caption}
							</Box>
						</Box>
					</>
				}
				secondary={
					<>
						{/* <Box fontWeight="fontWeightMedium" fontSize="subtitle1" mx={2} my={0} >
								{`${ISO4217[product.currency]['symbol']}${item.subtotal().toLocaleString()}`}
							</Box> */}
					</>
				} />
			<ListItemSecondaryAction>
				<Tooltip title='Delete' onClick={(e) => {
					e.stopPropagation()
					deleteSKU(sku)
					// const value = Number(qty.value) - 1
					// qty.setValue(`${Math.max(0, value)}`)
				}}>
					<IconButton>
						<RemoveCircleIcon color='inherit' />
					</IconButton>
				</Tooltip>
				<Tooltip title='Add' onClick={(e) => {
					e.stopPropagation()
					addSKU(sku)
					// const value = Number(qty.value) + 1
					// qty.setValue(`${value}`)
				}}>
					<IconButton>
						<AddCircleIcon color='inherit' />
					</IconButton>
				</Tooltip>
			</ListItemSecondaryAction>
		</ListItem>
	)
}
