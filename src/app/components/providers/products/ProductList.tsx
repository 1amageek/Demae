import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Card from './Card'
import ImageIcon from '@material-ui/icons/Image';
import { UserContext } from 'context'
import { useDataSourceListen } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading'
import ISO4217 from 'common/ISO4217'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			flexGrow: 1
		},
		gridPaper: {
			flexGrow: 1,
			padding: theme.spacing(2)
		},
		avater: {
			// width: theme.spacing(20),
			// height: theme.spacing(20),
			height: '100px',
			width: '100%',
			// paddingTop: '100%'
		}
	}),
);

export default ({ providerID }: { providerID: string }) => {
	const classes = useStyles()
	const [data, isLoading] = useDataSourceListen<Product>(Product, new Provider(providerID).products.collectionReference.limit(30))

	if (isLoading) {
		return (
			<Paper className={classes.paper} >
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Grid container spacing={2}>
			{data.map(doc => {
				return (
					<Grid item xs={6} key={providerID}>
						<Card providerID={providerID} product={doc} />
					</Grid>
				)
			})}
		</Grid>

	)
}

const GridItem = ({ providerID, product }: { providerID: string, product: Product }) => {

	const classes = useStyles()
	const [user] = useContext(UserContext)

	const price = product.price
	const currency = user?.currency || 'USD'
	const symbol = ISO4217[currency].symbol
	const amount = price[currency]
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined

	return (
		<>
			<Grid item xs={6} key={providerID}>
				<Paper className={classes.gridPaper} >
					{/* <Grid container spacing={2}>
						<Grid item xs={12}>
							<Avatar className={classes.avater} variant="rounded">
								<ImageIcon />
							</Avatar>
							<Box fontWeight="bold">
								<Typography>{product.name}</Typography>
							</Box>
						</Grid>
						<Grid item xs={12}>
							<Avatar className={classes.avater} variant="rounded">
								<ImageIcon />
							</Avatar>
						</Grid>
					</Grid> */}

					<Avatar className={classes.avater} variant="rounded" src={imageURL}>
						<ImageIcon />
					</Avatar>
					<Box fontWeight="bold" my={2}>
						<Typography>{product.name}</Typography>
						<Typography>{amount && symbol}{amount && amount.toLocaleString()}</Typography>
						<Typography>{product.caption}</Typography>
					</Box>
				</Paper>
				{/* <ListItemAvatar>
					<Avatar className={classes.avater} variant="rounded">
						<ImageIcon />
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={
						<>
							<Box mx={2} my={0} >
								<Typography variant='h6'>{`${product.name}`}</Typography>
								<Typography variant='caption'>{`${product.caption}`}</Typography>
							</Box>
						</>
					}
					secondary={
						<>
						</>
					} /> */}
			</Grid>
		</>
	)
}
