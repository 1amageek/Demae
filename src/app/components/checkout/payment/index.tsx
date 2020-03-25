import React, { useState } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { loadStripe } from '@stripe/stripe-js'
import {
	CardElement,
	Elements,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js'
import firebase from 'firebase'
import 'firebase/functions'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Loading from 'components/Loading'
import { useUser, useAuthUser } from 'hooks/commerce'
import User from 'models/commerce/User'

const STRIPE_KEY = process.env.STRIPE_KEY!
const stripePromise = loadStripe(STRIPE_KEY)

const CARD_OPTIONS = {
	// iconStyle: 'solid',
	style: {
		base: {
			// iconColor: '#c4f0ff',
			// color: '#fff',
			// fontWeight: '500',
			// fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
			fontSize: '18px',
			// fontSmoothing: 'antialiased',
			// ':-webkit-autofill': {
			// 	color: '#fce883',
			// },
			// '::placeholder': {
			// 	color: '#87BBFD',
			// },
		},
		invalid: {
			iconColor: '#FFC7EE',
			color: '#FFC7EE',
		},
	},
	hidePostalCode: true
};

export default () => (
	<Elements stripe={stripePromise}>
		<CheckoutForm />
	</Elements>
);

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			marginTop: theme.spacing(3),
			bottom: 50,
			width: '100%',
			flexGrow: 1,
			padding: theme.spacing(1),
		},
		title: {
			marginBottom: theme.spacing(3),
		},
		button: {
			width: '100%',
			flexGrow: 1,
			marginTop: theme.spacing(4)
		}
	}),
);

const CheckoutForm = () => {
	const classes = useStyles()
	const [auth] = useAuthUser()
	const [user, isUserLoading] = useUser()
	const stripe = useStripe();
	const elements = useElements()
	const [isDisabled, setDisable] = useState(true)
	const [isLoading, setLoading] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		if (!auth) { return }
		if (!stripe) { return }
		if (!elements) { return }
		const card = elements.getElement(CardElement)
		if (!card) { return }

		setLoading(true)

		try {
			const { error, paymentMethod } = await stripe.createPaymentMethod({
				type: 'card',
				card: card
			})

			if (error) {
				console.log(error)
				setLoading(false)
				return
			}

			if (!paymentMethod) {
				setLoading(false)
				return
			}

			const updateData = { defaultPaymentMethodID: paymentMethod.id }
			if (user?.customerID) {
				const attach = firebase.functions().httpsCallable('v1-stripe-paymentMethod-attach')
				const result = await attach({
					paymentMethodID: paymentMethod.id
				})
				console.log('[APP] attach payment method', result)
			} else {
				const create = firebase.functions().httpsCallable('v1-stripe-customer-create')
				const result = await create({
					payment_method: paymentMethod.id,
					phone: auth.phoneNumber,
					invoice_settings: {
						default_payment_method: paymentMethod.id
					},
					metadata: {
						uid: auth.uid
					}
				})
				console.log('[APP] create customer', result)
				if (result.data) {
					const customerID = result.data.id
					updateData['customerID'] = customerID
				}
			}
			await new User(auth.uid).documentReference.set(updateData, { merge: true })
			setLoading(false)
		} catch (error) {
			setLoading(false)
			console.log(error)
		}
	};

	if (isUserLoading) {
		return <Loading />
	} else {
		return (
			<Paper className={classes.paper}>
				<Typography variant={'h5'} className={classes.title}>
					Card
      	</Typography>
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
						disabled={isDisabled}
						onClick={handleSubmit}>Continue to Payment</Button>
				</form>
				{isLoading && <Loading />}
			</Paper>
		)
	}
}


