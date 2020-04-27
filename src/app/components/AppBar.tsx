import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import { Link } from 'react-router-dom'
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useUser } from 'hooks/commerce'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		menuButton: {
			marginRight: theme.spacing(2),
		},
		title: {
			flexGrow: 1,
		},
	}),
);

export default ({ title }: { title: string }) => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AppBar position='static' color='transparent' elevation={0}>
				<Container maxWidth='md'>
					<Toolbar>
						<Typography variant='h6' className={classes.title}>
							{title}
						</Typography>
						<LoginButton />
					</Toolbar>
				</Container>
			</AppBar>
		</div>
	);
}

const LoginButton = () => {
	const [user] = useUser()
	if (user) {
		return (
			<AccountCircle />
		)
	} else {
		return (
			<Button variant='contained' color='primary' component={Link} to='/login'>Login</Button>
		)
	}
}
