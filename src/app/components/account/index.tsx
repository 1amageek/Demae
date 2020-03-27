import React from 'react';
import Link from 'next/link'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import firebase from 'firebase'
import 'firebase/auth'

import { useProvider } from 'hooks/commerce'

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
	// const classes = useStyles();
	// const [data, isLoading] = useDataSource<Provider>(Provider.collectionReference().limit(100), Provider)
	// const [provider, isLoading] = useProvider()
	return (
		<>
			<Button variant="contained" color="primary" onClick={async () => {
				await firebase.auth().signOut()
			}}>
				SignOut
		</Button>

			<Link href='/providers/create'>
				<Button variant="contained" color="primary">
					Provider Create
				</Button>
			</Link>
		</>
	)
}
