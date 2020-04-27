import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom'
import Router from 'next/router'
import firebase, { database } from 'firebase';
import 'firebase/auth';
import 'firebase/functions';
import { List, ListItem, ListItemAvatar, Avatar } from '@material-ui/core';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import StorefrontIcon from '@material-ui/icons/Storefront';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import { UserContext } from 'hooks/commerce'
import { useDataSourceListen, useDocumentListen } from 'hooks/firestore';
import User, { Role } from 'models/commerce/User';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Provider from 'models/commerce/Provider';
import DataLoading from 'components/DataLoading';
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import Modal from 'components/Modal'
import Login from 'components/Login'
import { useDialog, DialogProps } from 'components/Dialog'
import { useErrorDialog } from 'components/ErrorDialog';
import { useProcessing } from 'components/Processing';
import Order from 'models/commerce/Order';

export default () => {
	const [user, isLoading, error] = useContext(UserContext)
	if (isLoading) {
		return <DataLoading />
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Paper>
					<OrderList />
				</Paper>
			</Grid>
		</Grid>
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

