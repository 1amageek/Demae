import React from 'react';
import { useRouter } from 'next/router'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Card from 'components/providers/products/Card'
import { useDocument, useDataSource } from 'hooks';
import { Provider, Product } from 'models/commerce';

export default ({ providerID, productID }: { providerID: string, productID: string }) => {
	const [data, isLoading] = useDocument<Product>(new Provider(providerID).products.collectionReference.doc(productID), Product)
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
