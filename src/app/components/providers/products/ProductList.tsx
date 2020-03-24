import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from 'components/providers/products/Card'
import { useDataSource } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDataSource(new Provider(providerID).products.collectionReference.limit(100), Product)
	return (
		<>
			{isLoading ? (
				<>loading</>
			) : (
					<Grid container spacing={2}>
						{data.map(doc => {
							return (
								<Grid key={doc.id} item xs={12} container>
									<Card href={`/providers/${providerID}/products/${doc.id}`} />
								</Grid>
							)
						})}
					</Grid>
				)}
		</>
	);
}
