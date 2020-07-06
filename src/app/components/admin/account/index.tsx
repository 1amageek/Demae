
import React, { useState } from 'react'
import { Container, Grid, Button, Box, Typography } from '@material-ui/core';
import Board from 'components/admin/Board'
import DataLoading from 'components/DataLoading';
import { useAccount } from 'hooks/account'
import { useFunctions } from 'hooks/stripe'


export default () => {

	const [account, isLoading] = useAccount()
	// const [data, isLoading] = useFunctions('stripe-v1-balance-retrieve')


	if (isLoading) {
		return (
			<Container maxWidth='sm'>
				<Board header={
					<Box>Account</Box>
				}>
					<DataLoading />
				</Board>
			</Container>
		)
	}

	if (!account || !account.accountID) {
		return (
			<Container maxWidth='sm'>
				<Board header={
					<Box>Account</Box>
				}>
					<Box padding={3}>
						<Box paddingBottom={3}>
							<Typography>There is no account. In order to start a business, you need to create an account.</Typography>
						</Box>
						<Button variant='contained' color='primary' size='large'>Create an account</Button>
					</Box>
				</Board>
			</Container>
		)
	}

	return (
		<Container maxWidth='sm'>
			<Board header={
				<Box>Account</Box>
			}>
				{account?.accountID}
			</Board>
		</Container>
	)
}

