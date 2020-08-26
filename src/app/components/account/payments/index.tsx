import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useHistory } from "react-router-dom"
import "firebase/auth";
import "firebase/functions";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { Container, List, ListItem, ListItemText, ListItemSecondaryAction, Chip } from "@material-ui/core";
import DataLoading from "components/DataLoading";
import { Paper, Typography, Box } from "@material-ui/core";
import { useFunctions } from "hooks/stripe"
import { Symbol } from "common/Currency"
import { useModal } from "components/Modal"
import Payout from "../payouts"
import { useAccount } from "hooks/account";

export default () => {

	return (
		<Container maxWidth="sm" disableGutters>
			<Typography variant="h1" gutterBottom>Account</Typography>
			<Box paddingY={1} marginBottom={2}>
				<Typography variant="h2" gutterBottom>Balance</Typography>
				<Paper elevation={0} square={false}>
					<Balance />
				</Paper>
			</Box>
			<Box paddingY={1} marginBottom={2}>
				<Typography variant="h2" gutterBottom>Bank Account</Typography>
				<Paper elevation={0} square={false}>
					<BankAccount />
				</Paper>
			</Box>
			<Box paddingY={1} marginBottom={2}>
				<Typography variant="h2" gutterBottom>Info</Typography>
				<Paper elevation={0} square={false}>
					<AccountInformation />
				</Paper>
			</Box>
		</Container>
	)
}

const AccountInformation = () => {
	const [account, isLoading] = useAccount()
	const businessType = account?.businessType
	const stripe = account?.stripe ?? {}


	if (isLoading) {
		return <DataLoading />
	}

	if (businessType === "company") {
		const info = stripe["company"] ?? {}
		return (
			<Box>
				<List>
					<ListItem button>
						<ListItemText
							primary="Name"
						/>
						<ListItemSecondaryAction>
							<Box display="flex" alignItems="center">

							</Box>
						</ListItemSecondaryAction>
					</ListItem>
				</List>
			</Box>
		)
	} else {
		const info = stripe["individual"] ?? {}
		const address = info.address ?? info.address_kanji
		return (
			<Box>
				<List>
					<ListItem>
						<ListItemText
							primary="Name"
							primaryTypographyProps={{ variant: "subtitle1" }}
						/>
						<ListItemSecondaryAction>
							<Typography variant="body1">{`${info.first_name} ${info.last_name}`}</Typography>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Address"
							primaryTypographyProps={{ variant: "subtitle1" }}
						/>
						<ListItemSecondaryAction>
							<Typography variant="body1">{`${address.state}${address.city}${address.town}${address.line1}${address.line2 ?? ""}`}</Typography>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="E mail"
							primaryTypographyProps={{ variant: "subtitle1" }}
						/>
						<ListItemSecondaryAction>
							<Typography variant="body1">{`${info.email}`}</Typography>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Phone"
							primaryTypographyProps={{ variant: "subtitle1" }}
						/>
						<ListItemSecondaryAction>
							<Typography variant="body1">{`${info.phone}`}</Typography>
						</ListItemSecondaryAction>
					</ListItem>
				</List>
			</Box>
		)
	}
}

const Balance = () => {
	const [data, isLoading] = useFunctions<any>("stripe-v1-balance-retrieve")
	const avalable = data?.available || []

	if (isLoading) {
		return <DataLoading />
	}

	return (
		<Table>
			<TableBody>
				{avalable.map((value, index) => {
					const currency = value.currency.toUpperCase() || "USD"
					const symbol = Symbol(currency)
					const amount = value.amount as number
					return (
						<TableRow key={index}>
							<TableCell>
								<Box display="flex" flexGrow={1} fontSize={15} fontWeight={800} justifyContent="center">
									{currency}
								</Box>
							</TableCell>
							<TableCell>
								<Box display="flex" flexGrow={1} fontSize={15} fontWeight={800} justifyContent="center">
									{symbol}{amount.toLocaleString()}
								</Box>
							</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}

const BankAccount = () => {
	const [account, isLoading] = useAccount()
	const [showModal, closeModal] = useModal()
	const currently_due: string[] = account?.stripe?.requirements.currently_due ?? []
	const isRequired = isLoading || currently_due.includes("external_account")
	const bankAccounts = account?.stripe?.external_accounts.data || []

	return (
		<Box>
			<List>
				{bankAccounts.map(value => {
					return (
						<ListItem button key={value.id}>
							<ListItemText primary={`${value.bank_name} - ${value.account_holder_name}`} primaryTypographyProps={{ variant: "subtitle1" }} />
							<ListItemSecondaryAction>
								<Box display="flex" alignItems="center">
									<NavigateNextIcon />
								</Box>
							</ListItemSecondaryAction>
						</ListItem>
					)
				})}

				<ListItem button onClick={() => {
					showModal(<Payout onClose={closeModal} />, false)
				}}>
					<ListItemText primary="Register your bank account" primaryTypographyProps={{ variant: "subtitle2" }} />
					<ListItemSecondaryAction>
						<Box display="flex" alignItems="center">
							{isRequired && <Chip variant="outlined" size="small" color="secondary" label="Required" />}
							<NavigateNextIcon />
						</Box>
					</ListItemSecondaryAction>
				</ListItem>
			</List>
		</Box>
	)
}
