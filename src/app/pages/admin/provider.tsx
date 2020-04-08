import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import Layout from 'components/admin/Layout'
import Provider from 'components/admin/provider'
import Paper from '@material-ui/core/Paper'
import { useProvider } from 'hooks/commerce';
import DataLoading from 'components/DataLoading'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			backgroundColor: theme.palette.background.paper,
			// padding: theme.spacing(2),
		},
	}),
);

export default () => {
	const classes = useStyles();
	const [provider, isLoading] = useProvider()
	if (isLoading) {
		return (
			<Layout>
				<Container maxWidth='md' >
					<Paper className={classes.paper}>
						<DataLoading />
					</Paper>
				</Container>
			</Layout >
		)
	}
	return (
		<Layout>
			<Container maxWidth='md' >
				<Paper className={classes.paper}>
					<Provider provider={provider!} />
				</Paper>
			</Container>
		</Layout >
	)
}
