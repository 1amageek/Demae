import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import 'firebase/functions'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FileInput from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { useAuthUser } from 'hooks/commerce'
import Input, { useInput } from 'components/Input'
import Account from 'models/account/Account'
import { Create, Individual } from 'common/commerce/account'
import Grid from '@material-ui/core/Grid';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(2),
			backgroundColor: '#fafafa'
		},
		bottomBox: {
			padding: theme.spacing(2),
			display: 'flex',
			justifyContent: 'flex-end'
		},
		input: {
			backgroundColor: '#fff'
		},
		cell: {
			borderBottom: 'none',
			padding: theme.spacing(1),
		},
	}),
);

export default () => {

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
	const classes = useStyles()
	const [authUser] = useAuthUser()

	const first_name = useInput(individual.first_name)
	const last_name = useInput(individual.last_name)
	const year = useInput(individual.dob?.year)
	const month = useInput(individual.dob?.month)
	const day = useInput(individual.dob?.day)
	const ssn_last_4 = useInput(individual.ssn_last_4)

	const country = useInput(individual.address?.country)
	const state = useInput(individual.address?.state)
	const city = useInput(individual.address?.city)
	const line1 = useInput(individual.address?.line1)
	const line2 = useInput(individual.address?.line2)
	const postal_code = useInput(individual.address?.postal_code)

	const email = useInput(individual.email)
	const phone = useInput(individual.phone)

	const shouldSubmit = () => {
		if (!authUser) {
			return false
		}
		if (first_name.value.length === 0) {
			return false
		}
		if (last_name.value.length === 0) {
			return false
		}
		if (email.value.length === 0) {
			return false
		}
		if (phone.value.length === 0) {
			return false
		}
		return true
	}

	const onSubmit = async () => {

		const uid = authUser?.uid
		if (!uid) { return }
		if (!shouldSubmit()) { return }

		const data: Create = {
			type: 'custom',
			country: 'US',
			business_type: 'individual',
			requested_capabilities: ['card_payments', 'transfers'],
			individual: {
				last_name: last_name.value,
				first_name: first_name.value,
				dob: {
					year: Number(year.value),
					month: Number(month.value),
					day: Number(day.value)
				},
				ssn_last_4: ssn_last_4.value,
				address: {
					country: country.value,
					state: state.value,
					city: city.value,
					line1: line1.value,
					line2: line2.value,
					postal_code: postal_code.value
				},
				email: email.value,
				phone: phone.value
			}
		}

		const accountCreate = firebase.app().functions('us-central1').httpsCallable('v1-stripe-account-create')
		try {
			const result = await accountCreate(data)
			const account = new Account(uid)
			account.accountID = result.data.id
			account.country = result.data.country
			account.businessType = result.data.business_type
			account.email = result.data.email
			// account.individual =
			await account.save()
			console.log(result)
		} catch (error) {
			console.log(error)
		}
	}

	const fileUpload = (body: FormData) => {
		return fetch('https://files.stripe.com/v1/files', {
			method: 'POST',
			mode: 'cors',
			body,
			headers: {
				Authorization: `Bearer ${process.env.STRIPE_KEY!}`,
				"Content-Type": "multipart/form-data"
			}
		})
	}

	const handleCapture = async ({ target }) => {
		const uid = authUser?.uid
		if (!uid) { return }
		console.log(target.files)
		const file = target.files[0] as File
		const ref = firebase.storage().ref(new Account(uid).documentReference.path + '/verification/back.jpg')
		try {
			const task = ref.put(file)
			task.on('state_changed', (snapshot) => {
				console.log(snapshot)
			}, (error) => {
				console.log(error)
			})
			task.resume()
		} catch (error) {
			console.log(error)
		}
	};

	return (
		<>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Typography variant="h6">
						Edit account information
          </Typography>
				</Toolbar>
			</AppBar>
			<form noValidate autoComplete='off'>
				<Box className={classes.box} >
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Table size='small'>
								<TableBody>
									<TableRow>
										<TableCell className={classes.cell} align='right'>First Name</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='first name' variant='outlined' margin='dense' size='small' {...first_name} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>Last Name</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='last name' variant='outlined' margin='dense' size='small' {...last_name} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>email</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='email' variant='outlined' margin='dense' size='small' {...email} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>Phone</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='phone' variant='outlined' margin='dense' size='small' {...phone} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>First Name</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='year' type='number' variant='outlined' margin='dense' size='small' {...year} style={{ width: '100px', marginRight: '8px' }} />
											<Input className={classes.input} required label='month' type='number' variant='outlined' margin='dense' size='small' {...month} style={{ width: '80px', marginRight: '8px' }} />
											<Input className={classes.input} required label='day' type='number' variant='outlined' margin='dense' size='small' {...day} style={{ width: '80px' }} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>SSN Last 4</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='SSN last 4' variant='outlined' margin='dense' size='small' {...ssn_last_4} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>Passport or Local ID card. (Front)</TableCell>
										<TableCell className={classes.cell} align='left'>
											<FileInput type="file" />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>Passport or Local ID card. (Back)</TableCell>
										<TableCell className={classes.cell} align='left'>
											<input accept="image/jpeg,image/png,application/pdf" type="file" onChange={handleCapture} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Table size='small'>
								<TableBody>
									<TableRow>
										<TableCell className={classes.cell} align='right'>line1</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='line1' variant='outlined' margin='dense' size='small' {...line1} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>line2</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='line2' variant='outlined' margin='dense' size='small' {...line2} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>city</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='city' variant='outlined' margin='dense' size='small' {...city} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>state</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='state' variant='outlined' margin='dense' size='small' {...state} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>postal code</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='postal code' variant='outlined' margin='dense' size='small' {...postal_code} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cell} align='right'>country</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} required label='country' variant='outlined' margin='dense' size='small' {...country} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
					</Grid>
				</Box>
				<Box className={classes.bottomBox} >
					<Button style={{}} variant='contained' size='medium' color='primary' type='submit' onClick={onSubmit}>
						Save
				</Button>
				</Box>
			</form>
		</>
	)
}
