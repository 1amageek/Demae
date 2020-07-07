import React, { useContext } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom"
import { Box, Paper, Container, Grid, ListItemAvatar, Avatar, Tooltip, IconButton, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import ImageIcon from "@material-ui/icons/Image";
import Summary from "./summary"
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import Login from "components/Login"
import Cart, { CartGroup, CartItem } from "models/commerce/Cart"
import DataLoading from "components/DataLoading";
import Checkout from "components/checkout/checkout"
import { useAuthUser } from "hooks/auth"
import { useUser, useCart } from "hooks/commerce";
import { CartContext } from "hooks/commerce"
import { useDrawer } from "components/Drawer";

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
		return <Container maxWidth="sm"><DataLoading /></Container>
	}

	if (!auth && !isLoading) {
		return <Container maxWidth="sm"><Login /></Container>
	}

	if (cart?.groups.length === 0) {
		return (
			<Container maxWidth="sm">
				<Typography variant="h1" gutterBottom>Cart</Typography>
				<Box display="flex" justifyContent="center" alignItems="center" padding={3} fontSize={17} fontWeight={600} color="text.secondary" height={200}>
					There are no items in your cart.
				</Box>
			</Container>
		)
	}

	return (
		<Container maxWidth="sm">
			<Typography variant="h1" gutterBottom>Cart</Typography>
			<Grid container spacing={2}>
				{cart?.groups.map(group => {
					return (
						<Grid item xs={12} key={group.providedBy}>
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
	const [showDrawer, onClose] = useDrawer()

	const subtotal = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartGroup.currency }).format(cartGroup.tax())

	return (
		<Paper>
			<List dense>
				{cartGroup.items.map(cartItem => {
					return <CartItemCell key={cartItem.skuReference!.path} cartGroup={cartGroup} cartItem={cartItem} />
				})}
			</List>
			<Box padding={2}>
				<Summary
					disabled={false}
					onClick={(e) => {
						e.preventDefault()
						showDrawer(
							<Checkout groupID={cartGroup.groupID}
								onClose={onClose}
								onComplete={() => {
									onClose()
									history.push(`/checkout/${cartGroup.providedBy}/completed`)
								}}
							/>
						)
					}}
					items={[{
						type: "subtotal",
						title: "Subtotal",
						detail: `${subtotal}`
					}, {
						type: "tax",
						title: "Tax",
						detail: `${tax}`
					}]} />
			</Box>
		</Paper>
	)
}

const CartItemCell = ({ cartGroup, cartItem }: { cartGroup: CartGroup, cartItem: CartItem }) => {

	const classes = useStyles()
	const [user] = useUser()
	const [cart] = useCart()

	const addItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (user) {
			if (cart) {
				const group = cart.cartGroup(cartGroup.groupID)
				group?.addItem(cartItem)
				await cart.save()
			} else {
				const cart = new Cart(user.id)
				const group = cart.cartGroup(cartGroup.groupID)
				group?.addItem(cartItem)
				await cart.save()
			}
		}
	}

	const deleteItem = async (event) => {
		event.preventDefault()
		event.stopPropagation()
		if (!cart) { return }
		const group = cart.cartGroup(cartGroup.groupID)
		group?.subtractItem(cartItem)
		if ((group?.items.length || 0) <= 0) {
			cart.groups = cart.groups.filter(group => group.groupID !== cartGroup.groupID)
		}
		await cart.save()
	}

	const imageURL = (cartItem.imageURLs().length > 0) ? cartItem.imageURLs()[0] : undefined
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartItem.currency }).format(cartItem.price())
	const subtotal = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartItem.currency }).format(cartItem.subtotal())

	return (
		<Box display="flex" padding={2}>
			<Box>
				<Avatar className={classes.avater} variant="rounded" src={imageURL}>
					<ImageIcon />
				</Avatar>
			</Box>
			<Box flexGrow={1}>
				<Box display="flex" justifyContent="space-between" flexGrow={1}>
					<Box mx={2}>
						<Typography variant="subtitle1">{cartItem.name}</Typography>
						<Typography variant="body1" color="textSecondary">{cartItem.caption}</Typography>
						<Typography variant="body1" color="textSecondary">{price}</Typography>
					</Box>
					<Box>
						<Box display="flex" justifyContent="flex-end" fontSize={16} fontWeight={500} >
							{subtotal}
						</Box>
						<Box display="flex" justifyContent="flex-end" alignItems="center" mx={0} my={0}>
							<Tooltip title="Remove">
								<IconButton onClick={deleteItem}>
									<RemoveCircleIcon color="inherit" />
								</IconButton>
							</Tooltip>
							<Box fontWeight={600} fontSize={16} mx={1}>
								{cartItem.quantity}
							</Box>
							<Tooltip title="Add">
								<IconButton onClick={addItem}>
									<AddCircleIcon color="inherit" />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

