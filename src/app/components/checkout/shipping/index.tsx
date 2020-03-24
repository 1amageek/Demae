import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import 'firebase/auth'
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Input, { useInput } from 'components/Input'
import Address from 'models/commerce/Address'
import { useAuthUser, useUserAddress } from 'hooks/commerce';
import Loading from 'components/Loading'
import { User } from 'models/commerce';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			maxWidth: 936,
			margin: 'auto',
			overflow: 'hidden',
		},
		searchBar: {
			borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
		},
		searchInput: {
			fontSize: theme.typography.fontSize,
		},
		block: {
			display: 'block',
		},
		addAction: {
			marginRight: theme.spacing(1),
		},
		contentWrapper: {
			margin: '40px 16px',
		},
	}),
);

export default ({ match }) => {
	const addressID = match.params.id
	if (addressID) {
		const [address, isLoading] = useUserAddress(addressID!);
		if (isLoading) {
			return <Loading />
		} else {
			return <Form address={address!} />
		}
	} else {
		const [authUser, isLoading] = useAuthUser()
		if (isLoading) {
			return <Loading />
		} else {
			const address: Address = new Address(new User(authUser!.uid).addresses.collectionReference.doc())
			return <Form address={address} />
		}
	}
}

const Form = ({ address }: { address: Address }) => {
	const [authUser, isLoading] = useAuthUser()
	const country = useInput(address?.country)
	const state = useInput(address?.state)
	const city = useInput(address?.city)
	const town = useInput(address?.town)
	const line1 = useInput(address?.line1)
	const line2 = useInput(address?.line2)
	const postal_code = useInput(address?.postal_code)

	const onClick = async () => {
		const user = new User(authUser!.uid)
		address.country = country.value
		address.state = state.value
		address.city = city.value
		address.town = town.value
		address.line1 = line1.value
		address.line2 = line2.value
		address.postal_code = postal_code.value
		await Promise.all([
			address.save(),
			user.documentReference.set({ defaultAddress: address.id }, { merge: true })
		])
	}

	return (
		<>
			<List >
				<ListItem key={"country"} >
					<ListItemText primary={"country"} />
					<Input {...country} />
				</ListItem>
				<ListItem key={"state"}>
					<ListItemText primary={"state"} />
					<Input {...state} />
				</ListItem>
				<ListItem key={"city"}>
					<ListItemText primary={"city"} />
					<Input {...city} />
				</ListItem>
				<ListItem key={"state"}>
					<ListItemText primary={"state"} />
					<Input {...state} />
				</ListItem>
				<ListItem key={"town"}>
					<ListItemText primary={"town"} />
					<Input {...town} />
				</ListItem>
				<ListItem key={"line1"}>
					<ListItemText primary={"line1"} />
					<Input {...line1} />
				</ListItem>
				<ListItem key={"line2"}>
					<ListItemText primary={"line2"} />
					<Input {...line2} />
				</ListItem>
				<ListItem key={"postal_code"}>
					<ListItemText primary={"postal_code"} />
					<Input {...postal_code} />
				</ListItem>
			</List>
			<Button variant="contained" color="primary" onClick={onClick}>Continue to Payment</Button>
		</>
	)
}
