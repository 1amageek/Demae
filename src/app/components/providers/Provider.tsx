import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from 'components/providers/Card'
import DataLoading from 'components/DataLoading';
import ProductList from 'components/providers/products/ProductList'
import { useDocumentListen } from 'hooks/firestore';
import { Provider } from 'models/commerce';

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDocumentListen<Provider>(Provider, Provider.collectionReference().doc(providerID))
	if (isLoading) {
		return <DataLoading />
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} container>
				<Card provider={data!} />
			</Grid>
			<Grid item xs={12} container>
				<ProductList providerID={providerID} />
			</Grid>
		</Grid>
	)
}
