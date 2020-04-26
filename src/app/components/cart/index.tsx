import React, { useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar, Tooltip, IconButton } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { useAuthUser, useUser, useCart } from 'hooks/commerce';
import { CartContext } from 'hooks/commerce'
import Summary from './summary'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Login from 'components/Login'
import ISO4217 from 'common/ISO4217'
import DataLoading from 'components/DataLoading';
import Cart, { CartGroup, CartItem } from 'models/commerce/Cart'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(14),
			height: theme.spacing(14),
		}
	}),
);

export default () => {
	const [auth] = useAuthUser()
	const [cart, isLoading] = useContext(CartContext)

	const subtotal = cart?.subtotal() || 0
	const tax = cart?.tax() || 0
	const currencyCode = cart?.currency || 'USD'
	const symbol = cart ? ISO4217[currencyCode]['symbol'] : ''

	if (!auth && !isLoading) {
		return <Login />
	}

	return (
		<Grid container spacing={2}>
			{cart?.groups.map(group => {
				return (
					<Grid item xs={12} key={group.providerID}>
						<CartGroupList cartGroup={group} />
					</Grid>
				)
			})}
		</Grid>
	)
}

const CartGroupList = ({ cartGroup }: { cartGroup: CartGroup }) => {
	const subtotal = cartGroup.subtotal() || 0
	const tax = cartGroup.tax() || 0
	const currencyCode = cartGroup.currency || 'USD'
	const symbol = ISO4217[currencyCode]['symbol']
	return (
		<Paper>
			<List dense>
				{cartGroup.items.map(cartItem => {
					return <CartItemCell key={cartItem.skuReference!.path} cartItem={cartItem} />
				})}
			</List>
			<Box padding={2}>
				<Summary cartGroup={cartGroup} items={[{
					type: 'subtotal',
					title: 'Subtotal',
					detail: `${symbol}${subtotal.toLocaleString()}`
				}, {
					type: 'tax',
					title: 'Tax',
					detail: `${symbol}${tax.toLocaleString()}`
				}]} />
			</Box>
		</Paper>
	)
}

const CartItemCell = ({ key, cartItem }: { key: string, cartItem: CartItem }) => {

	const classes = useStyles()
	const [user] = useUser()
	const [cart] = useCart()

	const addItem = async () => {
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

	const deleteItem = async () => {
		if (!cart) { return }
		cart.subtractItem(cartItem)
		await cart.save()
	}

	return (
		<ListItem key={key} dense>
			<ListItemAvatar>
				<Avatar className={classes.avater} variant="rounded">
					<ImageIcon />
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary={
					<Box display="flex" mx={2} my={1} >
						<Box flexGrow={1} fontWeight="fontWeightMedium" fontSize="h6.fontSize">
							<Typography variant='h6'>{`${cartItem.name}`}</Typography>
							<Typography>{`${cartItem.displayPrice()}`}</Typography>
						</Box>
						<Box fontWeight="fontWeightMedium" fontSize="h6.fontSize">{`${ISO4217[cartItem.currency]['symbol']}${cartItem.subtotal().toLocaleString()}`}</Box>
					</Box>
				}
				secondary={
					<Box display="flex" justifyContent="flex-end" alignItems="center" mx={0} my={0}>
						<Tooltip title='Remove' onClick={deleteItem}>
							<IconButton>
								<RemoveCircleIcon color='inherit' />
							</IconButton>
						</Tooltip>
						<Box fontWeight="fontWeightMedium" fontSize="h6.fontSize" mx={1}>
							{cartItem.quantity}
						</Box>
						<Tooltip title='Add' onClick={addItem}>
							<IconButton>
								<AddCircleIcon color='inherit' />
							</IconButton>
						</Tooltip>
					</Box>
				} />
		</ListItem>
	)
}

