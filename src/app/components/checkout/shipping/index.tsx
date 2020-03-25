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
import Shipping from 'models/commerce/Shipping'
import { useAuthUser, useUserShipping } from 'hooks/commerce';
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
	const shippingID = match.params.id
	if (shippingID) {
		const [shipping, isLoading] = useUserShipping(shippingID!);
		if (isLoading) {
			return <Loading />
		} else {
			return <Form shipping={shipping!} />
		}
	} else {
		const [authUser, isLoading] = useAuthUser()
		if (isLoading) {
			return <Loading />
		} else {
			const shipping: Shipping = new Shipping(new User(authUser!.uid).shippingAddresses.collectionReference.doc())
			return <Form shipping={shipping} />
		}
	}
}

const Form = ({ shipping }: { shipping: Shipping }) => {
	const [authUser, isLoading] = useAuthUser()
	const country = useInput(shipping.address?.country)
	const state = useInput(shipping.address?.state)
	const city = useInput(shipping.address?.city)
	const line1 = useInput(shipping.address?.line1)
	const line2 = useInput(shipping.address?.line2)
	const postal_code = useInput(shipping.address?.postal_code)

	const name = useInput(shipping.name)

	const onClick = async () => {
		const user = new User(authUser!.uid)
		// shipping.country = country.value
		shipping.address = {
			// country: country.value,
			state: state.value,
			city: city.value,
			line1: line1.value,
			line2: line2.value,
			postal_code: postal_code.value
		}
		shipping.name = name.value
		shipping.phone = authUser!.phoneNumber || ''
		await Promise.all([
			shipping.save(),
			user.documentReference.set({ defaultShipping: shipping.data() }, { merge: true })
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
				<ListItem key={"name"}>
					<ListItemText primary={"name"} />
					<Input {...name} />
				</ListItem>
			</List>
			<Button variant="contained" color="primary" onClick={onClick}>Continue to Payment</Button>
		</>
	)
}
