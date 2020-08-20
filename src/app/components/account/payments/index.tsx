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
import { useRequirement } from "hooks/account"
import Payout from "../payouts"

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
		</Container>
	)
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
	const [requirement] = useRequirement()
	const currentlyDue = requirement?.currentlyDue ?? []
	const isRequired = currentlyDue.find(task => task.id === "external_account")

	const [showModal, closeModal] = useModal()

	return (
		<Box>
			<List>
				<ListItem button onClick={() => {
					showModal(<Payout onClose={closeModal} />, false)
				}}>
					<ListItemText primary="Register your bank account" primaryTypographyProps={{ variant: "subtitle1" }} />
					<ListItemSecondaryAction>
						{!isRequired && <Chip variant="outlined" size="small" color="secondary" label="Required" />}
						<NavigateNextIcon />
					</ListItemSecondaryAction>
				</ListItem>
			</List>
		</Box>
	)
}
