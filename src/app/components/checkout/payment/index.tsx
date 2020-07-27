import React, { useState, useContext } from "react"
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles"
import { Tooltip, IconButton, Box } from "@material-ui/core";
import { useHistory } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import {
	CardElement,
	Elements,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js"
import firebase from "firebase"
import "firebase/functions"
import { Paper, AppBar, Toolbar, Button, Typography } from "@material-ui/core"
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Loading from "components/Loading"
import User from "models/commerce/User"
import { useAuthUser } from "hooks/auth"
import { UserContext } from "hooks/commerce"
import { useProcessing } from "components/Processing";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY!
const stripePromise = loadStripe(STRIPE_API_KEY)

const CARD_OPTIONS = {
	// iconStyle: "solid",
	style: {
		base: {
			fontSize: "16px",
		},
		invalid: {
			iconColor: "#FFC7EE",
			color: "#FFC7EE",
		},
	},
	hidePostalCode: true
};

export default () => {
	return (
		<Elements stripe={stripePromise}>
			<CheckoutForm />
		</Elements>
	)
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(3),
		},
		button: {
			width: "100%",
			flexGrow: 1,
			marginTop: theme.spacing(4)
		}
	}),
);

const CheckoutForm = () => {
	const classes = useStyles()
	const [auth] = useAuthUser()
	const [user, isUserLoading] = useContext(UserContext)
	const stripe = useStripe();
	const elements = useElements()
	const [isDisabled, setDisable] = useState(true)
	const history = useHistory()
	const [setProcessing] = useProcessing()

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
				type: "card",
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

			const updateData = { defaultPaymentMethodID: paymentMethod.id }
			if (user?.stripe?.customerID) {
				const attach = firebase.functions().httpsCallable("stripe-v1-paymentMethod-attach")
				const response = await attach({
					paymentMethodID: paymentMethod.id
				})
				const { error, result } = response.data
				if (error) {
					console.error(error)
					setProcessing(false)
					return
				}
				console.log("[APP] attach payment method", result)
			} else {
				const create = firebase.functions().httpsCallable("stripe-v1-customer-create")
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
			await new User(auth.uid).documentReference.set(updateData, { merge: true })
			setProcessing(false)
			history.goBack()
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
				<AppBar position="static" color="transparent" elevation={0}>
					<Toolbar disableGutters>
						<Tooltip title="Back" onClick={() => {
							history.goBack()
						}}>
							<IconButton>
								<ArrowBackIcon color="inherit" />
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
