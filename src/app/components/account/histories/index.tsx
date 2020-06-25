import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useParams } from 'react-router-dom'
import 'firebase/auth';
import 'firebase/functions';
import { List, ListItem, ListItemAvatar, Avatar, Container } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { useUser } from 'hooks/commerce'
import { useDataSourceListen, useDocumentListen, OrderBy } from 'hooks/firestore';
import DataLoading from 'components/DataLoading';
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import Order from 'models/commerce/Order';
import Dayjs from 'dayjs'
import Label from 'components/Label';

const DeliveryStatusLabel = {
	'none': 'NONE',
	'pending': 'PENDING',
	'preparing_for_delivery': 'TODO',
	'out_for_delivery': 'OUT FOR DELIVERY',
	'in_transit': 'IN TRANSIT',
	'failed_attempt': 'FAILED ATTEMPT',
	'delivered': 'DELIVERED',
	'available_for_pickup': 'AVAILABLE FOR PICKUP',
	'exception': 'EXCEPTION',
	'expired': 'EXPIRED'
}

const PaymentStatusLabel = {
	'none': 'NONE',
	'processing': 'PROCESSING',
	'succeeded': 'SUCCEEDED',
	'payment_failed': 'FAILED'
}

export default () => {
	const { orderID } = useParams()
	return (
		<Container maxWidth='sm'>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Paper>
						{orderID ? <OrderDetail orderID={orderID} /> : <OrderList />}
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}

const OrderList = () => {
	const [user, isLoading] = useUser()
	const ref = user?.orders.collectionReference
	const [orders, isDataLoading] = useDataSourceListen<Order>(Order, {
		path: ref?.path,
		orderBy: OrderBy('createdAt', 'desc'),
		limit: 100
	}, isLoading)

	if (isDataLoading) {
		return <DataLoading />
	}

	if (orders.length === 0) {
		return <Box padding={3} display='flex' justifyContent='center' fontWeight={600} fontSize={20}>There are no orders.</Box>
	}

	return (
		<List>
			{orders.map(data => {
				const orderedDate = Dayjs(data.createdAt.toDate())
				return (
					<ListItem key={data.id} button alignItems="flex-start" component={Link} to={`/account/orders/${data.id}`}>
						<ListItemAvatar>
							<Avatar variant="rounded" src={data.imageURLs()[0]}>
								<ImageIcon />
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={
							<>
								<Typography>
									{data.title}
								</Typography>
								<Typography variant="subtitle2">
									{`ID: ${data.id}`}
								</Typography>
								<Box fontSize={12}>
									{orderedDate.format('YYYY-MM-DD HH:mm:ss')}
								</Box>
								<Box display='flex'>
									<Label color='gray' fontSize={12}>{DeliveryStatusLabel[data.deliveryStatus]}</Label>
									<Label color='gray' fontSize={12}>{PaymentStatusLabel[data.paymentStatus]}</Label>
								</Box>
							</>
						} />
					</ListItem>
				)
			})}
		</List>
	)
}

const OrderDetail = ({ orderID }: { orderID: string }) => {
	const [user] = useUser()
	const ref = user?.orders.collectionReference.doc(orderID)
	const [order, isLoading] = useDocumentListen<Order>(Order, ref)

	if (isLoading || !order) {
		return <DataLoading />
	}

	return (
		<Box>{order.id}</Box>
	)
}
