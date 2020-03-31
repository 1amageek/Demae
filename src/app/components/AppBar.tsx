import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import 'firebase/auth'
import Link from 'next/link';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';

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
			<AppBar position="static">
				<Container maxWidth="lg">
					<Toolbar>
						<IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" className={classes.title}>
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
	const [auth, setAuth] = useState<firebase.User | null>(null)
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		const listener = firebase.auth().onAuthStateChanged(auth => {
			setAuth(auth)
			setLoading(false)
		})
		return () => {
			listener()
		}
	}, [auth?.uid])

	if (isLoading) {
		return <></>
	}

	if (auth) {
		return (
			<AccountCircle />
		)
	} else {
		return (
			<Link href='/login'>
				<Button color="inherit">Login</Button>
			</Link>
		)
	}
}
