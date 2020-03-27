import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Order, { OrderItem } from 'models/commerce/Order'
import { useCart } from 'hooks/commerce';
import Summary from './summary'
import Loading from 'components/Loading'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		text: {
			padding: theme.spacing(2, 2, 0),
		},
		paper: {
			paddingBottom: 50,
		},
		list: {
			marginBottom: theme.spacing(2),
		}
	}),
);

export default () => {
	const classes = useStyles()
	const [cart, isLoading] = useCart()

	const itemDelete = async (item: OrderItem) => {
		console.log('a')
		cart?.deleteItem(item)
		await cart?.update()
	}

	return (
		<>
			<Typography className={classes.text} gutterBottom>
				Cart
      </Typography>
			{isLoading ? (
				<Loading />
			) : (
					<List className={classes.list}>
						{cart!.items.map((item, index) => {
							return <Cell item={item} key={String(index)} onClick={async () => {
								await itemDelete(item)
							}} />
						})}
					</List>
				)}
			<Summary items={[{
				type: 'subtotal',
				title: 'Subtotal',
				detail: cart?.subtotal().toLocaleString() || '0'
			}, {
				type: 'tax',
				title: 'tax',
				detail: cart?.tax().toLocaleString() || '0'
			}]} />
		</>
	)
}

const Cell = ({ item, key, onClick }: { item: OrderItem, key: string, onClick: () => void }) => {
	return (
		<>
			<ListItem button key={key}>
				<ListItemText primary={item.name} secondary={item.caption} />
				<ListItemText primary={`Price ${item.subtotal().toLocaleString()}`} secondary={`Tax ${item.tax().toLocaleString()}`} />
				<ListItemSecondaryAction>
					<TextField value={item.quantity} />
					<Button onClick={onClick}>Delete</Button>
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}
