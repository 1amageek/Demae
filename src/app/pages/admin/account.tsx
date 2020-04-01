import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import Layout from 'components/admin/Layout'
import Form from 'components/admin/account/Form/US'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			backgroundColor: theme.palette.background.paper,
			padding: theme.spacing(2),
		},
	}),
);

export default () => {
	const classes = useStyles();
	return (
		<Layout>
			<Container maxWidth='sm' >
				<Paper className={classes.paper}>
					<Form />
				</Paper>
			</Container>
		</Layout >
	)
}
