import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { useDataSourceListen } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading'
import ISO4217 from 'common/ISO4217'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		avater: {
			width: theme.spacing(8),
			height: theme.spacing(8),
		}
	}),
);

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDataSourceListen<Product>(Product, new Provider(providerID).products.collectionReference.limit(30))

	if (isLoading) {
		return <DataLoading />
	}

	return (
		<List>
			{data.map(doc => {
				return (
					<ListItemCell providerID={providerID} product={doc} />
				)
			})}
		</List>
	)
}

const ListItemCell = ({ providerID, product }: { providerID: string, product: Product }) => {

	const classes = useStyles()

	return (
		<>
			<ListItem key={providerID}>
				<ListItemAvatar>
					<Avatar className={classes.avater} variant="rounded">
						<ImageIcon />
					</Avatar>
				</ListItemAvatar>
				{/* <ListItemText
					primary={
						<>
							<Box fontWeight="fontWeightMedium" fontSize="h6.fontSize" mx={2} my={0} >
								{`${product.name}`}
							</Box>
						</>
					}
					secondary={
						<>
							<Box fontWeight="fontWeightMedium" fontSize="subtitle1" mx={2} my={0} >
								{`${ISO4217[product.currency]['symbol']}${item.subtotal().toLocaleString()}`}
							</Box>
						</>
					} />
				<ListItemSecondaryAction>
					<Button onClick={onClick}>Delete</Button>
				</ListItemSecondaryAction> */}
			</ListItem>
		</>
	)
}




// export default ({ providerID }: { providerID: string }) => {
// 	const [data, isLoading] = useDataSourceListen<Product>(Product, new Provider(providerID).products.collectionReference.limit(30))

// 	if (isLoading) {
// 		return <DataLoading />
// 	}

// 	return (
// 		<Grid container spacing={2}>
// 			{data.map(doc => {
// 				return (
// 					<Grid key={doc.id} item xs={6} container>
// 						<Card providerID={providerID} product={doc} />
// 					</Grid>
// 				)
// 			})}
// 		</Grid>
// 	);
// }
