import React, { useState, useEffect } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, TableContainer, Table, TableBody, TableCell, TableRow, Avatar, Tooltip, IconButton, Slide, Button } from '@material-ui/core';

import ImageIcon from '@material-ui/icons/Image';
import { useUser, useCart } from 'hooks/commerce';
import Summary from 'components/cart/summary'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import ErrorIcon from '@material-ui/icons/Error';
import Login from 'components/Login'
import Cart, { CartGroup, CartItem } from 'models/commerce/Cart'
import DataLoading from 'components/DataLoading';
import Shipping from 'models/commerce/Shipping';
import { Card } from 'models/commerce/User';
import { usePush } from 'components/Navigation';
import ShippingAddressList from './ShippingAddress'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(10),
			height: theme.spacing(10),
		}
	}),
);

type View = 'summary' | 'card' | 'shipping'

export default ({ cart, setCart, onNext }: { cart: Cart, setCart: (data) => void, onNext: () => void }) => {

	const [view, setView] = useState<View>('summary')
	const [open, setOpen] = useState(false)

	return (
		<SummaryPage cart={cart} setCart={setCart} onNext={() => {
			setOpen(true)
		}} />
	)
}


const SummaryPage = ({ cart, setCart, onNext }: { cart: Cart, setCart: (data) => void, onNext: () => void }) => {
	const [user, isUserLoading] = useUser()
	const defaultShipping = user?.defaultShipping
	const defaultCart = user?.defaultCard
	const cartGroup = cart.groups[0]
	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.tax())

	const [push] = usePush()

	if (isUserLoading) {
		return <DataLoading />
	}

	return (
		<Paper style={{ width: '100%' }}>
			<TableContainer>
				<Table>
					<TableBody>
						<TableRow onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							push(
								<ShippingAddressList user={user!} />
							)
						}}>
							<TableCell style={{ width: '90px' }}>
								<Box color='text.secondary' fontWeight={700} flexGrow={1}>CARD</Box>
							</TableCell>
							<TableCell>
								<Box flexGrow={1} >
									{defaultCart?.brand}
								</Box>
							</TableCell>
							<TableCell>
								<Box display='flex' flexGrow={1} justifyContent="flex-end" alignItems='center'>{!defaultCart && <ErrorIcon color="secondary" />}</Box>
							</TableCell>
						</TableRow>
						<TableRow onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							console.log("aaaa")
						}}>
							<TableCell style={{ width: '90px' }}>
								<Box color='text.secondary' fontWeight={700} flexGrow={1}>SHIPPING</Box>
							</TableCell>
							<TableCell>
								{defaultShipping?.name && <Box>{defaultShipping?.name}</Box>}
								{defaultShipping?.address?.state && <Box>{defaultShipping?.address?.state}</Box>}
								{defaultShipping?.address?.city && <Box>{defaultShipping?.address?.city}</Box>}
								{defaultShipping?.address?.line1 && <Box>{`${defaultShipping?.address?.line1}${defaultShipping?.address?.line2}`}</Box>}
							</TableCell>
							<TableCell align='left'>
								<Box display='flex' flexGrow={1} justifyContent="flex-end" alignItems='center'>{!defaultShipping && <ErrorIcon color="secondary" />}</Box>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
			<Box padding={2}>
				<Box>
					{cartGroup.items.map(cartItem => {
						return <CartItemCell key={cartItem.skuReference!.path} cart={cart} cartItem={cartItem} setCart={setCart} />
					})}
				</Box>
				<Summary
					cartGroup={cartGroup}
					onClick={(e) => {
						e.preventDefault()
						onNext()
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

const CartItemCell = React.forwardRef(({ cart, cartItem, setCart }: { cart: Cart, cartItem: CartItem, setCart: (data) => void }, ref) => {

	const classes = useStyles()
	const [user] = useUser()

	const addItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (user) {
			cart.addItem(cartItem)
			setCart(cart.data())
		}
	}

	const deleteItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (!cart) { return }
		cart.subtractItem(cartItem)
		setCart(cart.data())
	}

	const imageURL = (cartItem.imageURLs().length > 0) ? cartItem.imageURLs()[0] : undefined
	const price = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartItem.currency }).format(cartItem.price())
	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartItem.currency }).format(cartItem.subtotal())

	return (
		<Box display='flex' paddingY={2}>
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
								<IconButton onClick={deleteItem} disabled={cartItem.quantity === 1}>
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
})
