import React from 'react'
import Paper from '@material-ui/core/Paper';
import { useHistory, Link } from 'react-router-dom'
import firebase from 'firebase'
import { Grid, AppBar, Toolbar, Checkbox, FormControlLabel } from '@material-ui/core';
import { List, ListItem, ListItemText, ListItemIcon, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { useUserShippingAddresses, UserContext, CartContext, useUser, useCart } from 'hooks/commerce'
import { useFetchList } from 'hooks/stripe'
import Loading from 'components/Loading'
import { Container, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider, Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DataLoading from 'components/DataLoading';
import CardBrand from 'common/stripe/CardBrand'
import * as Commerce from 'models/commerce'
import { PaymentMethod } from '@stripe/stripe-js';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar'
import { useDialog } from 'components/Dialog'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export default (props: any) => {
	const { providerID } = props.match.params
	const history = useHistory()
	const [user, isUserLoading] = useUser()
	const [cart] = useCart()
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	const enabled = (user?.stripe?.customerID && user?.defaultCard?.id && user?.defaultShipping)

	const checkout = async () => {
		if (!user) { return }
		if (!cart) { return }

		// customerID
		const customerID = user.stripe?.customerID
		if (!customerID) {
			return
		}

		// defaultShipping
		const defaultShipping = user.defaultShipping
		if (!defaultShipping) { return }

		// paymentMethodID
		const paymentMethodID = user.defaultCard?.id
		if (!paymentMethodID) { return }

		const cartGroup = cart.groups.find(group => group.providedBy === providerID)
		if (!cartGroup) { return }

		cartGroup.shipping = defaultShipping
		const data = cart.order(cartGroup)

		try {
			setProcessing(true)
			const checkoutCreate = firebase.functions().httpsCallable('commerce-v1-order-create')
			const response = await checkoutCreate({
				order: data,
				paymentMethodID: paymentMethodID,
				customerID: customerID
			})
			const { error, result } = response.data
			if (error) {
				console.error(error)
				setMessage('error', error.message)
				setProcessing(false)
				return
			}
			console.log(result)
			setMessage("success", "Success")
			history.push(`/checkout/${providerID}/completed`)
		} catch (error) {
			setMessage("error", "Error")
			console.log(error)
		}
		setProcessing(false)
	}

	if (isUserLoading) {
		return <Container maxWidth='sm'><Loading /></Container>
	}

	return (
		<Container maxWidth='sm'>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<ShippingAddresses user={user!} />
				</Grid>
				<Grid item xs={12}>
					<PaymentMethods user={user!} />
				</Grid>
				<Grid item xs={12}>
					<Button
						fullWidth
						variant="contained"
						size="large"
						color="primary"
						startIcon={<CheckCircleIcon />}
						disabled={!enabled}
						onClick={checkout}
					>
						Checkout
				</Button>
				</Grid>
			</Grid>
		</Container>
	)
}

const ShippingAddresses = ({ user }: { user: Commerce.User }) => {

	const [shippingAddresses, isLoading] = useUserShippingAddresses()
	const history = useHistory()
	const [setDialog, close] = useDialog()

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Typography variant='h6'>
						Shippingg Addresses
          </Typography>
				</Toolbar>
			</AppBar>
			{
				shippingAddresses.map(shipping => {
					return (
						<ExpansionPanel key={shipping.id} >
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<FormControlLabel
									onClick={async (event) => {
										event.stopPropagation()
										user.defaultShipping = shipping
										await user.save()
									}}
									onFocus={(event) => event.stopPropagation()}
									control={<Checkbox checked={user.defaultShipping?.id === shipping.id} />}
									label={

										<Typography>{shipping.format(['postal_code', 'line1'])}</Typography>
									}
								/>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<Typography>
									{shipping.formatted()}
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
												if (user?.defaultShipping?.id === shipping.id) {
													setDialog('Selected shipping address', 'This shipping address is currently selected. To delete this shipping address, please select another shipping address first.',
														[
															{
																title: 'OK'
															}])
												} else {
													await shipping?.delete()
												}
											}
										}])
								}}>Delete</Button>
								<Button size="small" color="primary" onClick={() => {
									history.push(`/checkout/shipping/${shipping.id}`)
								}}>
									Edit
          			</Button>
							</ExpansionPanelActions>
						</ExpansionPanel>
					)
				})
			}
			<List>
				<ListItem button component={Link} to='/checkout/shipping'>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new shpping address`} />
				</ListItem>
			</List>
		</Paper>
	)
}

const PaymentMethods = ({ user }: { user: Commerce.User }) => {

	const [setProcessing] = useProcessing()
	const [paymentMethods, isLoading, error, setPaymentMethods] = useFetchList<PaymentMethod>('stripe-v1-paymentMethod-list', { type: 'card' })
	const [setDialog, close] = useDialog()
	const [setMessage] = useSnackbar()

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

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Box fontSize={18} fontWeight={600}>
						Payments
          </Box>
				</Toolbar>
			</AppBar>
			{
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
									control={<Checkbox checked={user?.defaultCard?.id === method.id} />}
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
			<List>
				<ListItem button component={Link} to='/checkout/paymentMethod'>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new payment method`} />
				</ListItem>
			</List>
		</Paper>
	)
}
