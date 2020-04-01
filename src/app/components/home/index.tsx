import React from 'react';
import Link from 'next/link'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Card from 'components/providers/Card'
import { useDataSource } from 'hooks/commerce';
import { Provider } from 'models/commerce';
import Loading from 'components/Loading'

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

export default () => {
	const classes = useStyles();
	const [data, isLoading] = useDataSource<Provider>(Provider, Provider.collectionReference().limit(100))
	return (
		isLoading ? (
			<Loading />
		) : (
				<Grid container spacing={2}>
					{data.map(doc => {
						return (
							<Grid key={doc.id} item xs={12} container>
								<Card href={`/providers/${doc.id}`} />
							</Grid>
						)
					})}
				</Grid>
			)
	)
}
