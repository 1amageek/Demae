import React, { useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Tooltip, IconButton, ListItemAvatar, Avatar, Button } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import DataLoading from 'components/DataLoading';
import { useDataSourceListen } from 'hooks/commerce';
import { Provider, Product, SKU } from 'models/commerce';
import Input, { useInput } from 'components/Input'
import { CartContext } from 'context'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			width: '100%'
		},
		avater: {
			width: theme.spacing(16),
			height: theme.spacing(16),
		}
	}),
);

export default ({ providerID, productID }: { providerID: string, productID: string }) => {

	const classes = useStyles()
	const [cart] = useContext(CartContext)
	const [data, isLoading] = useDataSourceListen<SKU>(SKU,
		new Provider(providerID)
			.products.doc(productID, Product)
			.skus
			.collectionReference
			.limit(100))

	if (isLoading) {
		return (
			<Paper className={classes.paper} >
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper className={classes.paper} >
			<List>
				{data.map(doc => {
					return (
						<SKUListItem sku={doc} />
					)
				})}
			</List>
		</Paper>
	)
}

const SKUListItem = ({ sku }: { sku: SKU }) => {
	const classes = useStyles()
	// const qty = useInput("1")
	const [cart] = useContext(CartContext)

	const addSKU = async (sku: SKU) => {
		if (!cart) { return }
		cart.addSKU(sku)
		await cart.save()
	}

	const deleteSKU = async (sku: SKU) => {
		if (!cart) { return }
		cart.deleteSKU(sku)
		await cart.save()
	}

	return (
		<>
			<ListItem key={sku.id} >
				<ListItemAvatar>
					<Avatar className={classes.avater} variant="rounded">
						<ImageIcon />
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={
						<>
							<Box mx={2} my={0} >
								<Typography variant='h6'>{`${sku.name}`}</Typography>
								<Typography variant='caption'>{`${sku.caption}`}</Typography>
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
					<Tooltip title='Delete' onClick={() => {
						deleteSKU(sku)
						// const value = Number(qty.value) - 1
						// qty.setValue(`${Math.max(0, value)}`)
					}}>
						<IconButton>
							<RemoveCircleIcon color='inherit' />
						</IconButton>
					</Tooltip>
					{/* <Input variant='outlined' margin='dense' size='small' {...qty} style={{ width: '60px' }} /> */}
					<Tooltip title='Add' onClick={() => {
						addSKU(sku)
						// const value = Number(qty.value) + 1
						// qty.setValue(`${value}`)
					}}>
						<IconButton>
							<AddCircleIcon color='inherit' />
						</IconButton>
					</Tooltip>
					{/* <Button variant="contained" color="primary" onClick={() => {
						cart
					}}>Add to Bag</Button> */}
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}

// export CountQueuingStrategy a = ({ providerID, productID }: { providerID: string, productID: string }) => {

// 	const [data, isLoading] = useDataSourceListen<SKU>(SKU,
// 		new Provider(providerID)
// 			.products.doc(productID, Product)
// 			.skus
// 			.collectionReference
// 			.limit(100))

// 	if (isLoading) {
// 		return <DataLoading />
// 	}

// 	return (
// 		<Grid container spacing={2}>
// 			{data.map(doc => {
// 				return (
// 					<Grid key={doc.id} item xs={12} container>
// 						<Card sku={doc} />
// 					</Grid>
// 				)
// 			})}
// 		</Grid>
// 	);
// }
