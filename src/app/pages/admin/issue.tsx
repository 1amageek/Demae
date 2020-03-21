import React, { useState } from 'react';
import firebase from 'firebase'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Input, { useInput } from 'components/Input'
import Product from 'models/commerce/Product'
import { Individual, Address } from 'common/commerce/Types'


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			'& > *': {
				margin: theme.spacing(1),
				width: 200,
			},
		},
	}),
);


export default () => {
	const classes = useStyles()

	const onSubmit = async () => {
		// product.name = name
		// product.caption = caption
		// product.description = description
		// try {
		// 	await product.save()
		// } catch (error) {
		// 	console.error(error)
		// }
	}

	return (
		<IndividualForm individual={{}} />
	);
}

const IndividualForm = ({ individual }: { individual: Partial<Individual> }) => {

	const first_name = useInput(individual.first_name)
	const last_name = useInput(individual.last_name)
	const email = useInput(individual.email)
	const gender = useInput(individual.gender)
	const phone = useInput(individual.phone)
	const ssn_last_4 = useInput(individual.ssn_last_4)

	const onSubmit = async () => {
		const accountCreate = firebase.functions().httpsCallable('v1-stripe-account-create')
		await accountCreate({})
	}

	return (
		<form noValidate autoComplete="off">
			<FormControl>
				<Input label="first name" {...first_name} />
				<Input label="last name" {...last_name} />
				<Input label="email" {...email} />
				<Input label="gender" {...gender} />
				<Input label="phone" {...phone} />

			</FormControl>
			<Button variant="contained" color="primary" onClick={onSubmit}>
				Save
			</Button>
		</form>
	);

}

