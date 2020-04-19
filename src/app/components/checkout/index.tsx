import React, { useContext, useState } from 'react'
import Paper from '@material-ui/core/Paper';
import { withRouter, useHistory } from 'react-router-dom'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase'
import { Dialog, DialogContent, DialogContentText, DialogActions, DialogTitle, AppBar, Toolbar, Checkbox, FormControlLabel } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { useDataSource, useAuthUser, useUserShippingAddresses, useUser } from 'hooks/commerce'
import { UserContext, CartContext } from 'hooks/commerce'
import { usePaymentMethods } from 'hooks/stripe'
import User from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping';
import Loading from 'components/Loading'
import PaymentMethodList from './payment/PaymentMethodList'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DataLoading from 'components/DataLoading';
import { useDialog, DialogProps } from 'components/Dialog'
import * as Commerce from 'models/commerce'


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			// postion: 'fixed',
			bottom: 50,
			width: '100%',
			flexGrow: 1,
			padding: theme.spacing(1),
		},
		list: {
			marginBottom: theme.spacing(2),
		},
		button: {
			width: '100%',
			flexGrow: 1,
		}
	}),
);


export default () => {
	const classes = useStyles()
	const [auth] = useAuthUser()
	const [user, isUserLoading] = useContext(UserContext)
	const [cart, isCartLoading] = useContext(CartContext)
	const [paymentMethods, isPaymentMethodsLoading] = usePaymentMethods()
	const [shippingAddresses, isAddressLoading] = useUserShippingAddresses()

	const checkout = async () => {
		if (!user) { return }
		if (!cart) { return }

		// customerID
		const customerID = user.customerID
		if (!customerID) { return }

		// defaultShipping
		const defaultShipping = user.defaultShipping
		if (!defaultShipping) { return }

		// paymentMethodID
		const paymentMethodID = user.defaultPaymentMethodID
		if (!paymentMethodID) { return }

		cart.purchasedBy = user.id
		cart.shipping = defaultShipping
		cart.currency = 'USD'
		cart.amount = cart.total()
		const data = cart.data({ convertDocumentReference: true })
		const checkoutCreate = firebase.functions().httpsCallable('v1-commerce-checkout-create')

		try {
			const response = await checkoutCreate({
				order: data,
				paymentMethodID: paymentMethodID,
				customerID: customerID
			})
			const { error, result } = response.data
			if (error) {
				console.log(error)
				return
			}

			const token = result
			try {
				const checkoutConfirm = firebase.functions().httpsCallable('v1-commerce-checkout-confirm')
				const response = await checkoutConfirm(token)
				const { error, result } = response.data
				console.log(result)
			} catch (error) {
				console.log(error)
				return
			}

		} catch (error) {
			console.log(error)
		}
	}

	if (isUserLoading) {
		return <Loading />
	}

	return (
		<ShippingAddresses user={user!} />
	)

	// return (
	// 	<>
	// 		<Paper className={classes.paper}>
	// 			{isAddressLoading ? (
	// 				<Loading />
	// 			) : (
	// 					<List className={classes.list} >
	// 						{shippingAddresses.map(address => {
	// 							return (
	// 								<ListItem button key={address.id} component={Link} to={`/checkout/shipping/${address.id}`}>
	// 									<ListItemText primary={`${address.formatted()}`} />
	// 								</ListItem>
	// 							)
	// 						})}
	// 						<ListItem button component={Link} to='/checkout/shipping'>
	// 							<ListItemText primary={`Add Shpping Address`} />
	// 						</ListItem>
	// 					</List>
	// 				)}
	// 		</Paper>

	// 		<Paper className={classes.paper}>
	// 			{isPaymentMethodsLoading ? (
	// 				<Loading />
	// 			) : (
	// 					<PaymentMethodList paymentMethods={paymentMethods!} />
	// 				)}
	// 		</Paper>


	// 		<Button className={classes.button} variant='contained' color='primary' onClick={checkout} disabled={!(user?.customerID)}>
	// 			Payment
	//     </Button>
	// 	</>

	// )
}

const ShippingAddresses = ({ user }: { user: Commerce.User }) => {
	const [shippingAddresses, isLoading] = useUserShippingAddresses()
	const history = useHistory()
	const [deleteShipping, setDeleteShipping] = useState<Shipping | undefined>(undefined)
	const [setOpen, AlertDialog] = useDialog(_AlertDialog, async () => {
		await deleteShipping?.delete()
		setOpen(false)
	})

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
									// await shipping.delete()
									setDeleteShipping(shipping)
									setOpen(true)
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
			<AlertDialog />
		</Paper>
	)
}

const _AlertDialog = (props: DialogProps) => (
	<Dialog
		open={props.open}
		onClose={props.onClose}
	>
		<DialogTitle>Delete Shipping address</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Are you sure you want to delete it?
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={props.onClose}>
				Cancel
      </Button>
			<Button onClick={props.onNext} color='primary' autoFocus>
				OK
      </Button>
		</DialogActions>
	</Dialog>
)
