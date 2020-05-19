import { useState, useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import Input, { useInput } from 'components/Input';
import User from 'models/commerce/User';
import { SupportedCountries, CountryCode } from 'common/Country';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Toolbar';
import { Tooltip, IconButton } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Select, { useSelect } from 'components/Select'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Login from 'components/Login';
import Loading from 'components/Loading';
import { useAuthUser } from 'hooks/auth'
import { useUserShipping, useUser } from 'hooks/commerce';
import Shipping from 'models/commerce/Shipping';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
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
	})
)

export default (props: any) => {
	const { shippingID } = props.match.params
	const [user, isUserLoading] = useUser();
	const [shipping, isLoading] = useUserShipping(shippingID);

	if (isUserLoading || isLoading) {
		return <Loading />
	}

	if (!user) {
		return <Login />
	}

	if (shipping) {
		return <Form user={user} shipping={shipping} />
	} else {
		const shipping = new Shipping(user.shippingAddresses.collectionReference.doc())
		return <Form user={user} shipping={shipping} />
	}
}

const Form = ({ user, shipping }: { user: User, shipping: Shipping }) => {
	const classes = useStyles()
	const history = useHistory()
	const [auth] = useAuthUser();
	const [isProcessing, setProcessing] = useState(false)
	const country = useSelect({
		initValue: shipping.address?.country || user.country || "US",
		inputProps: {
			menu: SupportedCountries.map(country => {
				return { value: country.alpha2, label: country.name }
			})
		}
	})
	const state = useInput(shipping.address?.state)
	const city = useInput(shipping.address?.city)
	const line1 = useInput(shipping.address?.line1)
	const line2 = useInput(shipping.address?.line2)
	const postal_code = useInput(shipping.address?.postal_code)
	const name = useInput(shipping.name)

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!auth) return;
		const uid = auth.uid
		setProcessing(true)
		const user = new User(uid)
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
		shipping.phone = auth!.phoneNumber || ''
		await Promise.all([
			shipping.save(),
			user.documentReference.set({ defaultShipping: shipping.convert() }, { merge: true })
		])
		history.goBack()
		setProcessing(false)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar disableGutters>
					<Tooltip title='Back' onClick={() => {
						history.goBack()
					}}>
						<IconButton>
							<ArrowBackIcon color='inherit' />
						</IconButton>
					</Tooltip>
					<Box>
						Shipping Address
					</Box>
				</Toolbar>
			</AppBar>
			<form autoComplete='off' onSubmit={onSubmit}>
				<Box>
					<Table size='small'>
						<TableBody>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>country</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Select {...country} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>state</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='state' variant='outlined' margin='dense' size='small' required {...state} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>city</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='city' variant='outlined' margin='dense' size='small' required {...city} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>line1</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='line1' variant='outlined' margin='dense' size='small' required {...line1} />
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
								<TableCell className={classes.cell} align='right'>postal code</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='postal code' variant='outlined' margin='dense' size='small' required  {...postal_code} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>name</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='name' variant='outlined' margin='dense' size='small' required  {...name} />
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
						Continue to Payment
					</Button>
				</Box>
			</form>
			{isProcessing && <Loading />}
		</Paper>
	)
}
