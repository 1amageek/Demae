import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useHistory } from "react-router-dom"
import firebase, { database } from "firebase";
import "firebase/auth";
import "firebase/functions";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { Container } from "@material-ui/core"
import DataLoading from "components/DataLoading";
import { Paper, Grid, Typography, Box } from "@material-ui/core";
import { useFunctions } from "hooks/stripe"
import Board from "components/Board"
import { Symbol } from "common/Currency"

export default () => {

	return (
		<Container maxWidth="sm">
			<Balance />
		</Container>
	)
}

const Balance = () => {
	const history = useHistory()
	const [data, isLoading] = useFunctions<any>("stripe-v1-balance-retrieve")
	const avalable = data?.available || []

	if (isLoading) {
		return (
			<Board>
				<DataLoading />
			</Board>
		)
	}

	return (
		<Board onClick={() => {
			history.push("/account")
		}} header={
			<Box display="flex" flexGrow={1} fontSize={17} fontWeight={500}>
				Balance
			</Box>
		}>
			<Table>
				<TableBody>
					{avalable.map((value, index) => {
						const currency = value.currency.toUpperCase() || "USD"
						const symbol = Symbol(currency)
						const amount = value.amount as number
						return (
							<TableRow key={index}>
								{/* <ListItemText primary={value.currency} secondary={value.amount} /> */}
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
		</Board>
	)
}
