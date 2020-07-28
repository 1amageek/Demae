import React, { useContext, useState } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import firebase from 'firebase'
import { loadStripe } from '@stripe/stripe-js'
import {
	CardElement,
	Elements,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js'
import 'firebase/functions'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Paper, AppBar, Toolbar, Button, Typography, Tooltip, IconButton, FormControlLabel, Checkbox, Card } from '@material-ui/core'
import { List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Loading from 'components/Loading'
import { Container, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider, Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CardBrand from 'common/stripe/CardBrand'
import * as Commerce from 'models/commerce'
import { PaymentMethod } from '@stripe/stripe-js'
import DataLoading from 'components/DataLoading';
import { useDialog } from 'components/Dialog'
import { useFetchList } from 'hooks/stripe'
import { useAuthUser } from 'hooks/auth'
import { UserContext } from 'hooks/commerce'
import { useProcessing } from 'components/Processing';
import { usePush, usePop } from 'components/Navigation';
import { useSnackbar } from 'components/Snackbar'

export default ({ user }: { user: Commerce.User }) => {

	const [setProcessing] = useProcessing()
	const [paymentMethods, isLoading, error, setPaymentMethods] = useFetchList<PaymentMethod>('stripe-v1-paymentMethod-list', { type: 'card' })
	const [setMessage] = useSnackbar()
	const [setDialog, close] = useDialog()
	const [push] = usePush()
	const pop = usePop()

	if (error) {
		console.error(error)
	}

	const setDefaultPaymentMethod = async (paymentMethod: PaymentMethod) => {
		setProcessing(true)
		const customerUpdate = firebase.functions().httpsCallable('stripe-v1-customer-update')
		try {
			const response = await customerUpdate({
				// payment_method: paymentMethod.id,
				invoice_settings: {
					default_payment_method: paymentMethod.id
				}
			})
			const { result, error } = response.data
			if (error) {
				console.error(error)
				setProcessing(false)
				setMessage('error', error.message)
				return
			}
			const card = new Commerce.Card(paymentMethod.id)
			card.brand = paymentMethod.card!.brand
			card.expMonth = paymentMethod.card!.exp_month
			card.expYear = paymentMethod.card!.exp_year
			card.last4 = paymentMethod.card!.last4
			await user.documentReference.set({
				defaultCard: card.convert()
			}, { merge: true })
			console.log('[APP] set default payment method', result)
		} catch (error) {
			console.error(error)
		}
		setProcessing(false)
		pop()
	}

	const paymentMethodDetach = async (deletePaymentMethod: PaymentMethod) => {
		if (!deletePaymentMethod) {
			return
		}
		setProcessing(true)
		try {
			const detach = firebase.functions().httpsCallable('stripe-v1-paymentMethod-detach')
			const response = await detach({
				paymentMethodID: deletePaymentMethod.id
			})
			const { result, error } = response.data
			if (error) {
				console.error(error)
				setProcessing(false)
				setMessage('error', error.message)
				return
			}
			console.log('[APP] detach payment method', result)
			const data = paymentMethods.filter(method => method.id !== deletePaymentMethod.id)
			if (deletePaymentMethod.id === user.defaultCard?.id) {
				if (data.length > 0) {
					const method = data[0]
					await setDefaultPaymentMethod(method)
				} else {
					await user.documentReference.set({
						defaultCard: null
					}, { merge: true })
				}
			}
			setPaymentMethods(data)
		} catch (error) {
			console.error(error)
		}
		setProcessing(false)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Tooltip title='Back' onClick={() => {
						pop()
					}}>
						<IconButton>
							<ArrowBackIcon color='inherit' />
						</IconButton>
					</Tooltip>
					<Box fontSize={18} fontWeight={600}>
						Card
					</Box>
				</Toolbar>
			</AppBar>
			<List>
				<ListItem button onClick={() => {
					push(<CardInput callback={(paymentMethod) => {
						setPaymentMethods([...paymentMethods, paymentMethod])
					}} />)
				}}>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new payment method`} />
				</ListItem>
			</List>
			{isLoading ? <DataLoading /> :
				paymentMethods.map(method => {
					return (
						<ExpansionPanel key={method.id} >
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<FormControlLabel
									onClick={async (event) => {
										event.stopPropagation()
										await setDefaultPaymentMethod(method)
									}}
									onFocus={(event) => event.stopPropagation()}
									control={<Checkbox checked={user.defaultCard?.id === method.id} />}
									label={
										<Box display="flex" alignItems="center" flexGrow={1} style={{ width: '140px' }}>
											<Box display="flex" alignItems="center" flexGrow={1}>
												<i className={`pf ${CardBrand[method.card!.brand]}`}></i>
											</Box>
											<Box justifySelf="flex-end">
												{`• • • •  ${method.card?.last4}`}
											</Box>
										</Box>
									}
								/>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<Typography>
									expire {`${method.card?.exp_year}/${method.card?.exp_month}`}
								</Typography>
							</ExpansionPanelDetails>
							<Divider />
							<ExpansionPanelActions>
								<Button size="small" onClick={async () => {
									setDialog('Delete', 'Do you want to remove it?', [
										{
											title: 'Cancel',
											handler: close
										},
										{
											title: 'OK',
											handler: async () => {
												await paymentMethodDetach(method)
											}
										}])
								}}>Delete</Button>
							</ExpansionPanelActions>
						</ExpansionPanel>
					)
				})
			}
		</Paper>
	)
}

const STRIPE_API_KEY = process.env.STRIPE_API_KEY!
const stripePromise = loadStripe(STRIPE_API_KEY)

const CARD_OPTIONS = {
	style: {
		base: {
			fontSize: '16px',
		},
		invalid: {
			iconColor: '#FFC7EE',
			color: '#FFC7EE',
		},
	},
	hidePostalCode: true
};

const CardInput = ({ callback }: { callback?: (paymentMethod: PaymentMethod) => void }) => {
	return (
		<Elements stripe={stripePromise}>
			<Form callback={callback} />
		</Elements>
	)
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(3),
		},
		button: {
			width: '100%',
			flexGrow: 1,
			marginTop: theme.spacing(4)
		}
	}),
);

const Form = ({ callback }: { callback?: (paymentMethod: PaymentMethod) => void }) => {
	const classes = useStyles()
	const [auth] = useAuthUser()
	const [user, isUserLoading] = useContext(UserContext)
	const stripe = useStripe();
	const elements = useElements()
	const [isDisabled, setDisable] = useState(true)
	const [setProcessing] = useProcessing()
	const pop = usePop()
	const handleSubmit = async (event) => {
		event.preventDefault()
		if (!auth) return
		if (!stripe) return
		if (!elements) return
		const card = elements.getElement(CardElement)
		if (!card) return

		setProcessing(true)

		try {
			const { error, paymentMethod } = await stripe.createPaymentMethod({
				type: 'card',
				card: card
			})

			if (error) {
				console.log(error)
				setProcessing(false)
				return
			}

			if (!paymentMethod) {
				setProcessing(false)
				return
			}

			const cardMethod = new Commerce.Card(paymentMethod.id)
			cardMethod.id = paymentMethod.id
			cardMethod.brand = paymentMethod.card!.brand
			cardMethod.expMonth = paymentMethod.card!.exp_month
			cardMethod.expYear = paymentMethod.card!.exp_year
			cardMethod.last4 = paymentMethod.card!.last4

			let updateData: any = {
				defaultCard: cardMethod.convert()
			}

			if (user?.stripe?.customerID) {
				const attach = firebase.functions().httpsCallable('stripe-v1-paymentMethod-attach')
				const response = await attach({
					paymentMethodID: paymentMethod.id
				})
				const { error, result } = response.data
				if (error) {
					console.error(error)
					setProcessing(false)
					return
				}
				if (result) {
					if (callback) {
						callback(result)
					}
				}
				console.log('[APP] attach payment method', result)
			} else {
				const create = firebase.functions().httpsCallable('stripe-v1-customer-create')
				const response = await create({
					payment_method: paymentMethod.id,
					phone: auth.phoneNumber,
					invoice_settings: {
						default_payment_method: paymentMethod.id
					},
					metadata: {
						uid: auth.uid
					}
				})
				const { error, customer } = response.data

				if (error) {
					console.error(error)
					setProcessing(false)
					return
				}

				console.log("[APP] create customer", customer)
				if (customer) {
					updateData["stripe"] = {
						customerID: customer.id,
						link: `https://dashboard.stripe.com${
							customer.livemode ? "" : "/test"
							}/customers/${customer.id}`
					}
				}
			}
			await new Commerce.User(auth.uid).documentReference.set(updateData, { merge: true })
			setProcessing(false)
			pop()
		} catch (error) {
			setProcessing(false)
			console.log(error)
		}
	};

	if (isUserLoading) {
		return <Loading />
	} else {
		return (
			<Paper>
				<AppBar position='static' color='transparent' elevation={0}>
					<Toolbar disableGutters>
						<Tooltip title='Back' onClick={() => {
							pop()
						}}>
							<IconButton>
								<ArrowBackIcon color='inherit' />
							</IconButton>
						</Tooltip>
						<Box fontSize={18} fontWeight={600}>
							Card
						</Box>
					</Toolbar>
				</AppBar>
				<Box p={2}>
					<form>
						<CardElement
							options={CARD_OPTIONS}
							onChange={(e) => {
								setDisable(!e.complete)
							}}
						/>
						<Button className={classes.button}
							variant="contained"
							color="primary"
							size="large"
							disabled={isDisabled}
							onClick={handleSubmit}>Continue to Payment</Button>
					</form>
				</Box>
			</Paper>
		)
	}
}
