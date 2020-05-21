
import React from 'react';
import firebase from 'firebase'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Avatar, Tooltip, IconButton } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import { useUser, useCart } from 'hooks/commerce';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Cart, { CartItem } from 'models/commerce/Cart'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(10),
			height: theme.spacing(10),
		}
	})
)

export default React.forwardRef(({ groupID, cartItem }: { groupID: string, cartItem: CartItem }, ref) => {

	const classes = useStyles()
	const [user] = useUser()
	const [cart] = useCart()

	const addItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (user) {
			if (cart) {
				cart.addItem(cartItem, groupID)
				await cart.save()
			} else {
				const cart = new Cart(user.id)
				cart.addItem(cartItem, groupID)
				await cart.save()
			}
		}
	}

	const deleteItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (!cart) { return }
		cart.subtractItem(cartItem, groupID)
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
								<div>
									<IconButton onClick={deleteItem}>
										<RemoveCircleIcon color='inherit' />
									</IconButton>
								</div>
							</Tooltip>
							<Box fontWeight={600} fontSize={20} mx={1}>
								{cartItem.quantity}
							</Box>
							<Tooltip title='Add'>
								<div>
									<IconButton onClick={addItem}>
										<AddCircleIcon color='inherit' />
									</IconButton>
								</div>
							</Tooltip>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
})