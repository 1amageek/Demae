import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from 'components/providers/products/Card'
import { useDataSourceListen } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading'

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDataSourceListen<Product>(Product, new Provider(providerID).products.collectionReference.limit(30))

	if (isLoading) {
		return <DataLoading />
	}

	return (
		<Grid container spacing={2}>
			{data.map(doc => {
				return (
					<Grid key={doc.id} item xs={12} container>
						<Card providerID={providerID} product={doc} />
					</Grid>
				)
			})}
		</Grid>
	);
}
