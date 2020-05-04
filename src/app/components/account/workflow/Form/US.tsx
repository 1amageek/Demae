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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import DoneIcon from '@material-ui/icons/Done';
import Button from '@material-ui/core/Button';
import { useAuthUser } from 'hooks/auth'
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Account from 'models/account/Account'
import { Create, Individual } from 'common/commerce/account'
import Grid from '@material-ui/core/Grid';
import { Box } from '@material-ui/core';
import { Countries, Country } from 'common/Country';
import { nullFilter } from 'utils'
import Loading from 'components/Loading'
import RegisterableCountries from 'config/RegisterableCountries'

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
		cellStatus: {
			borderBottom: 'none',
			padding: theme.spacing(1),
			width: '48px',
		},
		cellStatusBox: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	}),
);

export default ({ individual, onCallback }: { individual: Partial<Individual>, onCallback?: (next: boolean) => void }) => {
	const classes = useStyles()
	const [authUser] = useAuthUser()
	const [open, setOpen] = useState(false)
	const [error, setError] = useState<string | undefined>()
	const first_name = useInput(individual.first_name, { inputProps: { pattern: '[A-Za-z]{1,32}' }, required: true })
	const last_name = useInput(individual.last_name, { inputProps: { pattern: '[A-Za-z]{1,32}' }, required: true })
	const year = useInput(individual.dob?.year, { inputProps: { pattern: '^[12][0-9]{3}$' }, required: true })
	const month = useInput(individual.dob?.month, { inputProps: { pattern: '^(0?[1-9]|1[012])$' }, required: true })
	const day = useInput(individual.dob?.day, { inputProps: { pattern: '^(([0]?[1-9])|([1-2][0-9])|(3[01]))$' }, required: true })
	const ssn_last_4 = useInput(individual.ssn_last_4, { inputProps: { pattern: '^[0-9]{4}$' }, required: true })
	const country = useSelect({
		initValue: individual.address?.country || 'US',
		inputProps: {
			menu: Countries.filter(country => RegisterableCountries.includes(country.value))
		},
		controlProps: {
			variant: 'outlined'
		}
	})
	const state = useInput(individual.address?.state, { required: true })
	const city = useInput(individual.address?.city, { required: true })
	const line1 = useInput(individual.address?.line1, { inputProps: { pattern: '[A-Za-z]{1,32}' }, required: true })
	const line2 = useInput(individual.address?.line2)
	const postal_code = useInput(individual.address?.postal_code, { required: true })
	const email = useInput(individual.email, { required: true, type: 'email' })
	const phone = useInput(individual.phone, { required: true, type: 'tel' })
	const [front, setFront] = useState<string | undefined>()
	const [back, setBack] = useState<string | undefined>()
	const [isFrontLoading, setFrontLoading] = useState(false)
	const [isBackLoading, setBackLoading] = useState(false)
	const [isLoading, setLoading] = useState(false)

	const handleClose = () => setOpen(false)

	const handleSubmit = async (event) => {
		event.preventDefault();
		const uid = authUser?.uid
		if (!uid) { return }
		let data: Create = {
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
					country: country.value as string,
					state: state.value,
					city: city.value,
					line1: line1.value,
					line2: line2.value,
					postal_code: postal_code.value
				},
				email: email.value,
				phone: phone.value,
				verification: {
					document: {
						front: front,
						back: back
					}
				}
			}
		}
		data = nullFilter(data)
		setLoading(true)
		const accountCreate = firebase.app().functions('us-central1').httpsCallable('v1-stripe-account-create')
		try {
			const response = await accountCreate(data)
			const { result, error } = response.data
			if (error) {
				setError(error.message)
				setLoading(false)
				setOpen(true)
				return
			}
			const account = new Account(uid)
			account.accountID = result.id
			account.country = result.country
			account.businessType = result.business_type
			account.email = result.email
			account.individual = result.individual
			await account.save()
			if (onCallback) {
				onCallback(true)
			}
			setLoading(false)
		} catch (error) {
			setLoading(false)
			setOpen(true)
			console.log(error)
		}
	}

	const handleFrontCapture = async ({ target }) => {
		const uid = authUser?.uid
		if (!uid) { return }
		setFrontLoading(true)
		const file = target.files[0] as File
		const ref = firebase.storage().ref(new Account(uid).documentReference.path + '/verification/front.jpg')
		ref.put(file).then(async (snapshot) => {
			if (snapshot.state === 'success') {
				const metadata = snapshot.metadata
				const { bucket, fullPath, name, contentType } = metadata
				const uploadFile = firebase.functions().httpsCallable('v1-stripe-file-upload')
				try {
					const result = await uploadFile({ bucket, fullPath, name, contentType, purpose: 'identity_document' })
					const data = result.data
					if (data) {
						setFront(data.id)
					}
				} catch (error) {
					console.error(error)
				}
			}
			setFrontLoading(false)
		})
	}

	const handleBackCapture = async ({ target }) => {
		const uid = authUser?.uid
		if (!uid) { return }
		setBackLoading(true)
		const file = target.files[0] as File
		const ref = firebase.storage().ref(new Account(uid).documentReference.path + '/verification/back.jpg')
		ref.put(file).then(async (snapshot) => {
			if (snapshot.state === 'success') {
				const metadata = snapshot.metadata
				const { bucket, fullPath, name, contentType } = metadata
				const uploadFile = firebase.functions().httpsCallable('v1-stripe-file-upload')
				try {
					const result = await uploadFile({ bucket, fullPath, name, contentType, purpose: 'identity_document' })
					const data = result.data
					if (data) {
						setBack(data.id)
					}
				} catch (error) {
					console.error(error)
				}
			}
			setBackLoading(false)
		})
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<Box className={classes.box} >
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Table size='small'>
								<TableBody>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>First Name</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='first name' variant='outlined' margin='dense' size='small' {...first_name} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>Last Name</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='last name' variant='outlined' margin='dense' size='small' {...last_name} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>email</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='email' variant='outlined' margin='dense' size='small' {...email} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>Phone</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='phone' variant='outlined' margin='dense' size='small' {...phone} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>Birth date</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='year' type='number' variant='outlined' margin='dense' size='small' {...year} style={{ width: '80px', marginRight: '8px' }} />
											<Input className={classes.input} label='month' type='number' variant='outlined' margin='dense' size='small' {...month} style={{ width: '66px', marginRight: '8px' }} />
											<Input className={classes.input} label='day' type='number' variant='outlined' margin='dense' size='small' {...day} style={{ width: '66px' }} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>SSN Last 4</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='SSN last 4' variant='outlined' margin='dense' size='small' {...ssn_last_4} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}>
											<Box className={classes.cellStatusBox}>
												{isFrontLoading && <CircularProgress size={16} />}
												{front && <DoneIcon color='primary' />}
											</Box>
										</TableCell>
										<TableCell className={classes.cell} align='right'>Passport or Local ID card. (front)</TableCell>
										<TableCell className={classes.cell} align='left'>
											<input accept='image/jpeg,image/png,application/pdf' type='file' onChange={handleFrontCapture} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}>
											<Box className={classes.cellStatusBox}>
												{isBackLoading && <CircularProgress size={16} />}
												{back && <DoneIcon color='primary' />}
											</Box>
										</TableCell>
										<TableCell className={classes.cell} align='right'>Passport or Local ID card. (Back)</TableCell>
										<TableCell className={classes.cell} align='left'>
											<input accept='image/jpeg,image/png,application/pdf' type='file' onChange={handleBackCapture} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Table size='small'>
								<TableBody>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>line1</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='line1' variant='outlined' margin='dense' size='small' {...line1} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>line2</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='line2' variant='outlined' margin='dense' size='small' {...line2} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>city</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='city' variant='outlined' margin='dense' size='small' {...city} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>state</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='state' variant='outlined' margin='dense' size='small' {...state} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>postal code</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Input className={classes.input} label='postal code' variant='outlined' margin='dense' size='small' {...postal_code} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className={classes.cellStatus}></TableCell>
										<TableCell className={classes.cell} align='right'>country</TableCell>
										<TableCell className={classes.cell} align='left'>
											<Select {...country} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Grid>
					</Grid>
				</Box>
				<Box className={classes.bottomBox} >
					<Button style={{}} size='medium' color='primary' onClick={() => {
						if (onCallback) {
							onCallback(false)
						}
					}}>Back</Button>
					<Button style={{}} variant='contained' size='medium' color='primary' type='submit'>Save</Button>
				</Box>
			</form>
			{isLoading && <Loading />}
			<Dialog
				open={open}
				onClose={handleClose}
			>
				<DialogTitle>Error</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{error ? error : 'Account registration failed.'}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='primary' autoFocus>
						OK
          </Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
