import React from 'react';
import { Grid, Box, Avatar } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import Card from 'components/providers/products/Card'
import { Provider, Product } from 'models/commerce';
import DataLoading from 'components/DataLoading';
import SKUList from './skus/SKUList';
import { useDocumentListen } from 'hooks/firestore';
import NotFound from 'components/NotFound'

export default ({ providerID, productID }: { providerID: string, productID: string }) => {
	const [data, isLoading] = useDocumentListen<Product>(Product, new Provider(providerID).products.collectionReference.doc(productID))
	const imageURL = (data?.imageURLs() || []).length > 0 ? data?.imageURLs()[0] : undefined
	if (isLoading) {
		return <DataLoading />
	}
	if (!data) {
		return <NotFound />
	}
	return (
		<>
			<Box
				width="100%"
				height="100%"
			>
				<Avatar variant="square" src={imageURL} alt={data.name} style={{
					minHeight: '64px',
					height: '100%',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
			<Box padding={2}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<SKUList providerID={providerID} productID={productID} />
					</Grid>
				</Grid>
			</Box>
		</>
	)
}
