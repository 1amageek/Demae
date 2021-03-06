
import React, { useState } from "react"
import { Container, Grid, Button, Box, Typography } from "@material-ui/core";
import DataLoading from "components/DataLoading";
import { useAccount } from "hooks/account"
import { useFunctions } from "hooks/stripe"
import Workflow from "components/account/workflow"
import Balance from "components/account/payments"

export default () => {
	const [data, isLoading, error] = useFunctions("stripe-v1-account-retrieve")
	console.log(data, isLoading, error)
	return (
		<Box paddingTop={10}>
			<Content />
		</Box>
	)
}

const Content = () => {
	const [account, isLoading] = useAccount()

	if (isLoading) return <DataLoading />

	if (account?.stripe === undefined) return <Workflow />

	return <Balance />
}
