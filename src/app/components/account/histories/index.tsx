import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom'
import Router from 'next/router'
import firebase, { database } from 'firebase';
import 'firebase/auth';
import 'firebase/functions';
import { List, ListItem, ListItemAvatar, Avatar, Container } from '@material-ui/core';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import StorefrontIcon from '@material-ui/icons/Storefront';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import { UserContext } from 'hooks/commerce'
import { useDataSourceListen, useDocumentListen } from 'hooks/firestore';
import DataLoading from 'components/DataLoading';
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import Order from 'models/commerce/Order';

export default () => {
	const [user, isLoading, error] = useContext(UserContext)
	if (isLoading) {
		return (
			<Container maxWidth='sm'>
				<DataLoading />
			</Container>
		)

	}

	return (
		<Container maxWidth='sm'>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Paper>
						<OrderList />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}


const OrderList = () => {
	const [user, isLoading] = useContext(UserContext)
	const ref = user?.orders.collectionReference
	const [orders, isDataLoading] = useDataSourceListen<Order>(Order, { path: ref?.path }, isLoading)

	if (isDataLoading) {
		return <DataLoading />
	}

	if (orders.length === 0) {
		return <Box padding={3} display='flex' justifyContent='center' fontWeight={600} fontSize={20}>There are no orders.</Box>
	}

	return (
		<List>
			{
				orders.map(order => {
					return (
						<ListItem button key={order.id} component={Link} to="/">
							<ListItemAvatar>
								<Avatar src={order.imageURLs()[0]} variant='rounded' />
							</ListItemAvatar>
							<ListItemText primary={order.title} secondary={order.shippingDate} />
						</ListItem>
					)
				})
			}
		</List>
	)
}

