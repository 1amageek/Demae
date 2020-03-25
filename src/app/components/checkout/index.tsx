import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import firebase from 'firebase'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import { useUser, useDataSource, useAuthUser, useCart } from 'hooks/commerce'
import { usePaymentMethods } from 'hooks/stripe'
import User from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping';
import Loading from 'components/Loading'
import PaymentMethodList from './payment/PaymentMethodList'

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
	const [user, isUserLoading] = useUser()
	const [cart, isCartLoading] = useCart()
	const [paymentMethods, isPaymentMethodsLoading] = usePaymentMethods()
	const [shippingAddresses, isAddressLoading] = useDataSource<Shipping>(new User(auth?.uid).shippingAddresses.collectionReference.limit(10), Shipping)

	const checkout = async () => {
		if (!user) { return }
		if (!cart) { return }
		const customerID = user.customerID
		if (!customerID) { return }
		console.log(user.data())
		const defaultShipping = user.defaultShipping
		if (!defaultShipping) { return }
		const paymentMethodID = user.defaultPaymentMethodID
		if (!paymentMethodID) { return }

		const paymentIntentCreate = firebase.functions().httpsCallable('v1-stripe-paymentIntent-create')
		const result = await paymentIntentCreate({
			setup_future_usage: 'off_session',
			amount: cart.total(),
			currency: cart.currency,
			customer: customerID,
			shipping: defaultShipping.data(),
			payment_method: paymentMethodID,
			metadata: {
				uid: user.id,
			}
		})
		console.log(result)
	}

	return (
		<>
			<Paper className={classes.paper}>
				{isAddressLoading ? (
					<Loading />
				) : (
						<List className={classes.list} >
							{shippingAddresses.map(address => {
								return (
									<ListItem button key={address.id} component={Link} to={`/checkout/shipping/${address.id}`}>
										<ListItemText primary={`${address.formatted()}`} />
									</ListItem>
								)
							})}
							<ListItem button component={Link} to='/checkout/shipping'>
								<ListItemText primary={`Add Shpping Address`} />
							</ListItem>
						</List>
					)}
			</Paper>

			<Paper className={classes.paper}>
				{isPaymentMethodsLoading ? (
					<Loading />
				) : (
						<PaymentMethodList paymentMethods={paymentMethods!} />
					)}
			</Paper>


			<Button className={classes.button} variant="contained" color="primary" onClick={checkout} disabled={!(user?.customerID)}>
				Payment
      </Button>
		</>

	)
}
