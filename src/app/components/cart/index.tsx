import React, { useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link, useHistory } from 'react-router-dom'
import { Box, Paper, Typography, Container, Grid, ListItemAvatar, Avatar, Tooltip, IconButton } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { useAuthUser } from 'hooks/auth'
import { useUser, useCart } from 'hooks/commerce';
import { CartContext } from 'hooks/commerce'
import Summary from './summary'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Login from 'components/Login'
import Cart, { CartGroup, CartItem } from 'models/commerce/Cart'
import { Symbol } from 'common/Currency'
import DataLoading from 'components/DataLoading';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(10),
			height: theme.spacing(10),
		}
	}),
);

export default () => {
	const [auth] = useAuthUser()
	const [cart, isLoading] = useContext(CartContext)

	if (isLoading) {
		return <Container maxWidth='sm'><DataLoading /></Container>
	}

	if (!auth && !isLoading) {
		return <Container maxWidth='sm'><Login /></Container>
	}

	if (cart?.groups.length === 0) {
		return (
			<Container maxWidth='sm'>
				<Box display='flex' justifyContent='center' alignItems='center' padding={3} fontSize={17} fontWeight={600} color='text.secondary' height={200}>
					There are no items in your cart.
				</Box>
			</Container>
		)
	}

	return (
		<Container maxWidth='sm'>
			<Typography component="h2">Cart</Typography>
			<Grid container spacing={2}>
				{cart?.groups.map(group => {
					return (
						<Grid item xs={12} key={group.providerID}>
							<CartGroupList cartGroup={group} />
						</Grid>
					)
				})}
			</Grid>
		</Container>
	)
}

const CartGroupList = ({ cartGroup }: { cartGroup: CartGroup }) => {

	const history = useHistory()
	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.tax())

	return (
		<Paper>
			<List dense>
				{cartGroup.items.map(cartItem => {
					return <CartItemCell key={cartItem.skuReference!.path} cartItem={cartItem} />
				})}
			</List>
			<Box padding={2}>
				<Summary
					cartGroup={cartGroup}
					onClick={(e) => {
						e.preventDefault()
						history.push(`/checkout/${cartGroup.providerID}`)
					}}
					items={[{
						type: 'subtotal',
						title: 'Subtotal',
						detail: `${subtotal}`
					}, {
						type: 'tax',
						title: 'Tax',
						detail: `${tax}`
					}]} />
			</Box>
		</Paper>
	)
}

const CartItemCell = ({ cartItem }: { cartItem: CartItem }) => {

	const classes = useStyles()
	const [user] = useUser()
	const [cart] = useCart()

	const addItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (user) {
			if (cart) {
				cart.addItem(cartItem)
				await cart.save()
			} else {
				const cart = new Cart(user.id)
				cart.addItem(cartItem)
				await cart.save()
			}
		}
	}

	const deleteItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (!cart) { return }
		cart.subtractItem(cartItem)
		await cart.save()
	}

	const imageURL = (cartItem.imageURLs().length > 0) ? cartItem.imageURLs()[0] : undefined
	const price = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartItem.currency }).format(cartItem.price())
	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartItem.currency }).format(cartItem.subtotal())

	return (
		<Box display='flex' padding={2}>
			<Box>
				<Avatar className={classes.avater} variant="rounded" src={imageURL}>
					<ImageIcon />
				</Avatar>
			</Box>
			<Box flexGrow={1}>
				<Box display="flex" justifyContent="space-between" flexGrow={1}>
					<Box mx={2}>
						<Box flexGrow={1} fontWeight={600} fontSize={18}>
							{cartItem.name}
							<Box fontSize={16} fontWeight={400}>
								{cartItem.caption}
							</Box>
							<Box fontSize={16} fontWeight={400} color='text.secondary'>
								{price}
							</Box>
						</Box>
					</Box>
					<Box>
						<Box display="flex" justifyContent="flex-end" fontSize={18} fontWeight={500} >
							{subtotal}
						</Box>
						<Box display="flex" justifyContent="flex-end" alignItems="center" mx={0} my={0}>
							<Tooltip title='Remove'>
								<IconButton onClick={deleteItem}>
									<RemoveCircleIcon color='inherit' />
								</IconButton>
							</Tooltip>
							<Box fontWeight={600} fontSize={20} mx={1}>
								{cartItem.quantity}
							</Box>
							<Tooltip title='Add'>
								<IconButton onClick={addItem}>
									<AddCircleIcon color='inherit' />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

