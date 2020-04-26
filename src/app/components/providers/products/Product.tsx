import React from 'react';
import { useRouter } from 'next/router'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Card from 'components/providers/products/Card'
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading';
import SKUList from './skus/SKUList';
import { useDocumentListen } from 'hooks/firestore';
import NotFound from 'components/NotFound'

export default ({ providerID, productID }: { providerID: string, productID: string }) => {
	const [data, isLoading] = useDocumentListen<Product>(Product, new Provider(providerID).products.collectionReference.doc(productID))
	if (isLoading) {
		return <DataLoading />
	}
	if (!data) {
		return <NotFound />
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Card providerID={providerID} product={data!} />
			</Grid>
			<Grid item xs={12}>
				<SKUList providerID={providerID} productID={productID} />
			</Grid>
		</Grid>
	)
}
