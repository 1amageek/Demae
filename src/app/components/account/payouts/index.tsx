import React, { useContext, useState } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import firebase from 'firebase'
import { loadStripe } from '@stripe/stripe-js'
import {
	AuBankAccountElement,
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
			width: '100%',
			flexGrow: 1,
			marginTop: theme.spacing(4)
		}
	}),
);

const Form = () => {
	return (
		<Box p={2}>
			<form>
				<AuBankAccountElement
					// options={CARD_OPTIONS}
					onChange={(e) => {

					}}
				/>
				<Button
					variant="contained"
					color="primary"
					size="large"
					onClick={() => { }}>Continue to Payment</Button>
			</form>
		</Box>
	)
}
