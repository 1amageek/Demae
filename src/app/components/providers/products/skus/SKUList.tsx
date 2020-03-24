import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from 'components/providers/products/skus/Card'
import { useDataSource } from 'hooks/commerce';
import { Provider, Product, SKU } from 'models/commerce';

export default ({ providerID, productID }: { providerID: string, productID: string }) => {

	const [data, isLoading] = useDataSource<SKU>(
		new Provider(providerID)
			.products.doc(productID, Product)
			.skus
			.collectionReference
			.limit(100), SKU)
	return (
		<>
			{isLoading ? (
				<>loading</>
			) : (
					<Grid container spacing={2}>
						{data.map(doc => {
							return (
								<Grid key={doc.id} item xs={12} container>
									<Card sku={doc} />
								</Grid>
							)
						})}
					</Grid>
				)}
		</>
	);
}
