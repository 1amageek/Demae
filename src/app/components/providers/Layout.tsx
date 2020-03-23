import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		paper: {
			padding: theme.spacing(2),
			margin: 'auto',
			maxWidth: 500,
		}
	})
)

export default ({ children }: { children: any }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<Container className={classes.paper}>
				{children}
			</Container>
		</div>
	);
}
