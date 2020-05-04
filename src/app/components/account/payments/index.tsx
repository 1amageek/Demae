import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom'
import firebase, { database } from 'firebase';
import 'firebase/auth';
import 'firebase/functions';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import StorefrontIcon from '@material-ui/icons/Storefront';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import { Container } from '@material-ui/core'
import DataLoading from 'components/DataLoading';
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import { useFunctions } from 'hooks/stripe'
import ISO4217 from 'common/ISO4217'
import Board from 'components/Board'


export default () => {

	return (
		<Container maxWidth='sm'>
			<Balance />
		</Container>
	)
}

const Balance = () => {
	const history = useHistory()
	const [data, isLoading] = useFunctions<any>('v1-stripe-balance-retrieve')
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
			history.push('/account')
		}} header={
			<Box display='flex' flexGrow={1} fontSize={17} fontWeight={500}>
				Balance
			</Box>
		}>
			<Table>
				<TableBody>
					{avalable.map((value, index) => {
						const currency = value.currency.toUpperCase() || 'USD'
						const symbol = ISO4217[currency].symbol
						const amount = value.amount as number
						return (
							<TableRow key={index}>
								{/* <ListItemText primary={value.currency} secondary={value.amount} /> */}
								<TableCell>
									<Box display='flex' flexGrow={1} fontSize={15} fontWeight={800} justifyContent='center'>
										{currency}
									</Box>
								</TableCell>
								<TableCell>
									<Box display='flex' flexGrow={1} fontSize={15} fontWeight={800} justifyContent='center'>
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
