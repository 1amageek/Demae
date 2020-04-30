import { useState, useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { withRouter, useHistory } from 'react-router-dom'
import Input, { useInput } from 'components/Input';
import User, { Role } from 'models/commerce/User';
import { Country, Countries } from 'common/Country';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Toolbar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, IconButton } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Select, { useSelect } from 'components/Select'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Login from 'components/Login';
import Loading from 'components/Loading';
import { useDialog, DialogProps } from 'components/Dialog'
import { useAuthUser } from 'hooks/auth'
import { useUserShipping } from 'hooks/commerce';
import Shipping from 'models/commerce/Shipping';

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
	})
)

const _ErrorDialog = (props: DialogProps) => (
	<Dialog
		open={props.open}
		onClose={props.onClose}
	>
		<DialogTitle>Error</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Creation of provider failed. Please try again with good communication conditions.
					</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={props.onNext} color='primary' autoFocus>
				OK
      </Button>
		</DialogActions>
	</Dialog>
)

export default (props: any) => {
	const { shippingID } = props.match.params
	const [auth, isAuthLoading] = useAuthUser();
	const [shipping, isLoading] = useUserShipping(shippingID);

	if (isAuthLoading || isLoading) {
		return <Loading />
	}

	if (!auth) {
		return <Login />
	}

	if (shipping) {
		return <Form shipping={shipping} />
	} else {
		const user = new User(auth?.uid)
		const shipping = new Shipping(user.shippingAddresses.collectionReference.doc())
		return <Form shipping={shipping} />
	}
}

const Form = ({ shipping }: { shipping: Shipping }) => {
	const classes = useStyles()
	const history = useHistory()
	const [auth] = useAuthUser();
	const [isProcessing, setProcessing] = useState(false)
	const [ErrorDialog, setOpen] = useDialog(_ErrorDialog, () => {
		setOpen(false)
	})
	const country = useSelect({
		initValue: shipping.address?.country || "US",
		inputProps: {
			menu: Countries
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
			user.documentReference.set({ defaultShipping: shipping.data() }, { merge: true })
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
					<Typography variant='h6'>
						Shipping Address
          </Typography>
				</Toolbar>
			</AppBar>
			<form autoComplete='off' onSubmit={onSubmit}>
				<Box className={classes.box}>
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
			<ErrorDialog />
		</Paper>
	)
}
