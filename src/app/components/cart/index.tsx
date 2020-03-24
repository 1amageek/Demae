import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
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
							return <Cell item={item} key={String(index)} />
						})}
					</List>
				)}
			<Summary items={[{
				type: 'price',
				title: 'Price',
				detail: '1000'
			}]} />
		</>
	)
}

const Cell = ({ item, key }: { item: OrderItem, key: string }) => {
	return (
		<>
			<ListItem button key={key}>
				<ListItemText primary={item.name} secondary={item.caption} />
				<ListItemText primary={`Price ${item.price().toLocaleString()}`} secondary={`Tax ${item.tax().toLocaleString()}`} />
				<ListItemSecondaryAction>
					<TextField value={item.quantity} />
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}
