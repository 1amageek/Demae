import React from "react"
import firebase from "firebase"
import { loadStripe } from "@stripe/stripe-js"
import {
	Elements,
	useStripe
} from "@stripe/react-stripe-js"
import "firebase/functions"
import { Paper, Button, Typography, FormControl, Card } from "@material-ui/core"
import { Container, Box } from "@material-ui/core";
import { useAuthUser } from "hooks/auth"
import { useSnackbar } from "components/Snackbar"
import { useProcessing } from "components/Processing";
import Select, { useSelect, useMenu } from "components/_Select"
import TextField, { useTextField } from "components/TextField"

const STRIPE_API_KEY = process.env.STRIPE_API_KEY!
const stripePromise = loadStripe(STRIPE_API_KEY)

export default ({ onClose }: { onClose?: () => void }) => {
	return (
		<Elements stripe={stripePromise}>
			<Form onClose={onClose} />
		</Elements>
	)
}

const Form = ({ onClose }: { onClose?: () => void }) => {
	const stripe = useStripe()
	const [auth] = useAuthUser()
	const [showProgress] = useProcessing()
	const [showSnackbar] = useSnackbar()
	const [account_holder_type] = useSelect("individual")
	const account_holder_types = useMenu([
		{
			label: "Individual",
			value: "individual"
		},
		{
			label: "Company",
			value: "company"
		}
	])
	const [routing_number] = useTextField("", { inputProps: { pattern: "^[0-9]{7}$" }, required: true })
	const [account_number] = useTextField("", { inputProps: { pattern: "^[0-9]{5,9}$" }, required: true })
	const [account_holder_name] = useTextField("", { inputProps: { pattern: "^[A-Za-zァ-ヴー・\s]{1,32}" }, required: true })

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!stripe) return
		if (!auth) return
		showProgress(true)
		const { token } = await stripe.createToken("bank_account", {
			country: "JP",
			currency: "JPY",
			routing_number: routing_number.value as string,
			account_number: account_number.value as string,
			account_holder_name: account_holder_name.value as string,
			account_holder_type: account_holder_type.value as string
		})

		if (!token) {
			showProgress(false)
			showSnackbar("error", "Your bank account registration was unsuccessful. Please try again after a while.")
			return
		}

		const createExternalAccount = firebase.functions().httpsCallable("account-v1-bankAccount-create")
		const response = await createExternalAccount({
			external_account: token!.id,
			default_for_currency: true,
			metadata: {
				uid: auth.uid
			}
		})
		const { error } = response.data
		if (error) {
			showProgress(false)
			showSnackbar("error", "Your bank account registration was unsuccessful. Please try again after a while.")
			return
		} else {
			showSnackbar("success", "You have successfully registered your bank account.")
			showProgress(false)
			if (onClose) {
				onClose()
			}
		}
	}

	return (
		<Container maxWidth="sm" disableGutters>
			<Typography variant="h1" gutterBottom>Bank Account</Typography>
			<Paper>
				<Box padding={2}>
					<form onSubmit={onSubmit}>
						<Box display="flex">
							<FormControl variant="outlined" margin="dense" size="small" style={{ width: "140px" }}>
								<Select variant="outlined" {...account_holder_type} >
									{account_holder_types}
								</Select>
							</FormControl>
						</Box>
						<Box display="flex">
							<TextField label="ROUTING NUMBER" variant="outlined" margin="dense" size="small" fullWidth {...routing_number} />
						</Box>
						<Box display="flex">
							<TextField label="ACCOUNT NUMBER" variant="outlined" margin="dense" size="small" fullWidth {...account_number} />
						</Box>
						<Box display="flex">
							<TextField label="ACCOUNT NAME" variant="outlined" margin="dense" size="small" fullWidth {...account_holder_name} />
						</Box>
						<Box paddingTop={2}>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								size="large"
								fullWidth
							>OK</Button>
						</Box>
						<Box paddingTop={1}>
							<Button
								variant="text"
								color="primary"
								size="large"
								fullWidth
								onClick={onClose}
							>Cancel</Button>
						</Box>
					</form>
				</Box>
			</Paper>
		</Container>
	)
}
