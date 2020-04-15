import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import TextField from '@material-ui/core/TextField';
import Order, { OrderItem } from 'models/commerce/Order'
import { useCart } from 'hooks/commerce';
import Summary from './summary'
import Loading from 'components/Loading'
import ISO4217 from 'common/ISO4217'
import DataLoading from 'components/DataLoading';
import Cart from 'models/commerce/Cart'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(7),
			height: theme.spacing(7),
		}
	}),
);

export default () => {
	const [cart, isLoading] = useCart()
	if (isLoading) {
		return <DataLoading />
	}
	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<CartItemList cart={cart!} />
				</Grid>
				<Grid item xs={12}>
					<Summary items={[{
						type: 'subtotal',
						title: 'Subtotal',
						detail: `${ISO4217[cart!.currency]['symbol']}${cart!.subtotal().toLocaleString()}`
					}, {
						type: 'tax',
						title: 'Tax',
						detail: `${ISO4217[cart!.currency]['symbol']}${cart!.tax().toLocaleString()}`
					}]} />
				</Grid>
			</Grid>
		</>
	)
}

const CartItemList = ({ cart }: { cart: Cart }) => {

	const itemDelete = async (item: OrderItem) => {
		cart.deleteItem(item)
		await cart.update()
	}

	return (
		<Paper>
			<List>
				{cart && cart.items.map((item, index) => {
					return <Cell item={item} key={String(index)} onClick={async () => {
						await itemDelete(item)
					}} />
				})}
			</List>
		</Paper>
	)
}

const Cell = ({ item, key, onClick }: { item: OrderItem, key: string, onClick: () => void }) => {

	const classes = useStyles()

	return (
		<>
			<ListItem key={key}>
				<ListItemAvatar>
					<Avatar className={classes.avater} variant="rounded">
						<ImageIcon />
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={
						<>
							<Box fontWeight="fontWeightMedium" fontSize="h6.fontSize" mx={2} my={0} >
								{`${item.name}`}
							</Box>
						</>
					}
					secondary={
						<>
							<Box fontWeight="fontWeightMedium" fontSize="subtitle1" mx={2} my={0} >
								{`${ISO4217[item.currency]['symbol']}${item.subtotal().toLocaleString()}`}
							</Box>
						</>
					} />
				<ListItemSecondaryAction>
					{/* <TextField value={item.quantity} /> */}
					<Button onClick={onClick}>Delete</Button>
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}

