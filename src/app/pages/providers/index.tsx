import React from 'react';
import Link from 'next/link'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Card from 'components/accounts/Card'
import { useDataSource } from 'hooks';
import { Provider } from 'models/commerce';

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

export default function ComplexGrid() {
	const classes = useStyles();
	const datasource = useDataSource(Provider.collectionReference().limit(100), Provider)
	return (
		<div className={classes.root}>
			<Container className={classes.paper}>
				<Grid container spacing={2}>

					<Grid item xs={12} container>
						<Card />
					</Grid>
					<Grid item xs={12} container>
						<Card />
					</Grid>
					<Grid item xs={12} container>
						<Card />
					</Grid>
					<Grid item xs={12} container>
						<Card />
					</Grid>
				</Grid>
			</Container>
		</div>
	);
}
