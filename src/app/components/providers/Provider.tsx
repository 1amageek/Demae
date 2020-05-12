import React from 'react';
import { Grid, Box, Avatar } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import DataLoading from 'components/DataLoading';
import ProductList from 'components/providers/products/ProductList'
import { useDocumentListen } from 'hooks/firestore';
import { Provider } from 'models/commerce';
import NotFound from 'components/NotFound'

export default ({ providerID }: { providerID: string }) => {
	const [data, isLoading] = useDocumentListen<Provider>(Provider, Provider.collectionReference().doc(providerID))
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
				<Avatar variant="square" src={data.coverImageURL()} alt={data.name} style={{
					minHeight: '64px',
					height: '100%',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
			<Box padding={2}>
				<Grid container spacing={2}>
					<Grid item xs={12} container>
						<ProductList providerID={providerID} />
					</Grid>
				</Grid>
			</Box>
		</>
	)
}
