import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography, Button, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
import Card from './Card'
import { useDataSourceListen, Where } from 'hooks/firestore';
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading'


export default ({ providerID }: { providerID: string }) => {
	const ref = new Provider(providerID).products.collectionReference
	const [data, isLoading] = useDataSourceListen<Product>(Product, { path: ref.path, wheres: [Where('isAvailable', '==', true)], limit: 30 })

	if (isLoading) {
		return (
			<DataLoading />
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
