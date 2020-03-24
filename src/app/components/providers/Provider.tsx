import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Card from 'components/providers/products/Card'
import { useDocument, useDataSource } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDocument<Provider>(Provider.collectionReference().doc(providerID), Provider)
	return (
		<>
			{isLoading ? (
				<>loading</>
			) : (
					<Card href="" />
				)}
		</>
	);
}
