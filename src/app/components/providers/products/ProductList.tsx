import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Card from './Card'
import { useDataSourceListen } from 'hooks/firestore';
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
	const ref = new Provider(providerID).products.collectionReference
	const [data, isLoading] = useDataSourceListen<Product>(Product, { path: ref.path, limit: 30 })

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
					<Grid item xs={6} key={doc.id}>
						<Card providerID={providerID} product={doc} />
					</Grid>
				)
			})}
		</Grid>
	)
}
