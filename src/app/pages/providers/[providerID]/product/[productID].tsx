import React from 'react';
import Link from 'next/link'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Card from 'components/provider/product/Card'
import { useDataSource } from 'hooks';
import { Provider, Product } from 'models/commerce';


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		paper: {
			padding: theme.spacing(2),
			margin: 'auto',
			maxWidth: 500,
		},
		image: {
			width: 128,
			height: 128,
		},
		img: {
			margin: 'auto',
			display: 'block',
			maxWidth: '100%',
			maxHeight: '100%',
		},
	}),
);

const index = ({ providerID }: { providerID: string }) => {
	const classes = useStyles();
	const provider = new Provider(providerID)
	const datasource = useDataSource(provider.products.collectionReference.limit(100), Product)
	return (
		<div className={classes.root}>
			<Container className={classes.paper}>
				<Grid container spacing={2}>
					{datasource.map(doc => {
						return (
							<Grid key={doc.id} item xs={12} container>
								<Card href={`/providers/${providerID}/products/${doc.id}`} />
							</Grid>
						)
					})}
				</Grid>
			</Container>
		</div>
	);
}

index.getInitialProps = async (ctx) => {
	const providerID = ctx.query.providerID
	return { providerID }
}

export default index
