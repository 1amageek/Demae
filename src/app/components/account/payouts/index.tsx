import React, { useContext, useState } from "react"
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles"
import firebase from "firebase"
import { loadStripe } from "@stripe/stripe-js"
import {
	AuBankAccountElement,
	CardElement,
	IbanElement,
	IdealBankElement,
	Elements,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js"
import "firebase/functions"
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Paper, AppBar, Toolbar, Button, Typography, Tooltip, IconButton, FormControlLabel, FormControl, Card } from "@material-ui/core"
import { List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Loading from "components/Loading"
import { Container, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider, Box } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CardBrand from "common/stripe/CardBrand"
import * as Commerce from "models/commerce"
import { PaymentMethod } from "@stripe/stripe-js"
import DataLoading from "components/DataLoading";
import { useDialog } from "components/Dialog"
import { useFetchList } from "hooks/stripe"
import { useAuthUser } from "hooks/auth"
import { UserContext } from "hooks/commerce"
import { useProcessing } from "components/Processing";
import { usePush, usePop } from "components/Navigation";
import Select, { useSelect, useMenu } from "components/_Select"
import TextField, { useTextField } from "components/TextField"

const STRIPE_API_KEY = process.env.STRIPE_API_KEY!
const stripePromise = loadStripe(STRIPE_API_KEY)

const CARD_OPTIONS = {
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
			<Form />
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

const Form = () => {

	const stripe = useStripe();


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
	const [account_holder_name] = useTextField("", { inputProps: { pattern: "^[A-Za-zァ-ヴー・]{1,32}" }, required: true })

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!stripe) return

		const token = await stripe.createToken("bank_account", {
			country: "JP",
			currency: "JPY",
			routing_number: routing_number.value as string,
			account_number: account_number.value as string,
			account_holder_name: account_holder_name.value as string,
			account_holder_type: account_holder_type.value as string
		})

		console.log(token)
	}


	return (
		<Box p={2}>
			<form onSubmit={onSubmit}>

				<Box display="flex">
					<FormControl variant="outlined" margin="dense" size="small" style={{ width: "140px" }}>
						<Select variant="outlined" {...account_holder_type} >
							{account_holder_types}
						</Select>
					</FormControl>
					<TextField label="ROUTING NUMBER" variant="outlined" margin="dense" size="small" fullWidth {...routing_number} />
				</Box>
				<Box display="flex">
					<TextField label="ACCOUNT NUMBER" variant="outlined" margin="dense" size="small" fullWidth {...account_number} />
				</Box>
				<Box display="flex">
					<TextField label="ACCOUNT NAME" variant="outlined" margin="dense" size="small" fullWidth {...account_holder_name} />
				</Box>
				<Button
					type="submit"
					variant="contained"
					color="primary"
					size="large"
					onClick={() => { }}>Continue to Payment</Button>
			</form>
		</Box>
	)
}
