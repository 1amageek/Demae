
import React, { useState } from 'react'
import firebase from 'firebase'
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import DndCard from 'components/DndCard'
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import { DeliveryStatus } from 'common/commerce/Types'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';


import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useAdminProviderOrders, useAdminProvider } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { Order } from 'models/commerce';
import { ListItemSecondaryAction } from '@material-ui/core';
import { useDataSourceListen, Where, OrderBy } from 'hooks/firestore'
import Dayjs from 'dayjs'

const Status = {
	'none': 'None',
	'pending': 'Pending',
	'preparing_for_delivery': 'Todo',
	'out_for_delivery': 'Out for delivery',
	'in_transit': 'In transit',
	'failed_attempt': 'Failed attempt',
	'delivered': 'Delivered',
	'available_for_pickup': 'Available for pickup',
	'exception': 'Exception',
	'expired': 'Expired'
}

export default ({ orderID, deliveryMethod, deliveryStatus, paymentStatus }: { orderID?: string, deliveryMethod?: string, deliveryStatus?: string, paymentStatus?: string }) => {
	const [provider, waiting] = useAdminProvider()
	const collectionReference = provider ? provider.orders.collectionReference : undefined
	const wheres = [
		deliveryMethod ? Where('deliveryMethod', '==', deliveryMethod) : undefined,
		deliveryStatus ? Where('deliveryStatus', '==', deliveryStatus) : undefined,
		// paymentStatus ? Where('paymentStatus', '==', paymentStatus) : undefined
	].filter(value => !!value)
	const [orderBy, setOrderBy] = useState<firebase.firestore.OrderByDirection>('desc')
	const [orders, isLoading] = useDataSourceListen<Order>(Order, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy('createdAt', orderBy)
	}, waiting)
	const history = useHistory()


	if (isLoading) {
		return (
			<Board header={
				<Box>Order</Box>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	return (
		<Board hideBackArrow header={
			<>
				<Box>Order</Box>
				<Box flexGrow={1} />
				<Tooltip title='asc' onClick={() => {
					setOrderBy('asc')
				}}>
					<IconButton>
						<KeyboardArrowDownIcon color='inherit' />
					</IconButton>
				</Tooltip>
				<Tooltip title='desc' onClick={() => {
					setOrderBy('desc')
				}}>
					<IconButton>
						<KeyboardArrowUpIcon color='inherit' />
					</IconButton>
				</Tooltip>
			</>
		}>
			<List>
				{orders.map(data => {
					const orderedDate = Dayjs(data.createdAt.toDate())
					return (
						<ListItem key={data.id} button selected={orderID === data.id} onClick={() => {
							history.push(`/admin/orders/${data.id}`)
						}}>
							<ListItemAvatar>
								<Avatar variant="rounded" src={data.imageURLs()[0]} >
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
								</>
							} secondary={orderedDate.format('YYYY-MM-DD HH:mm:ss')} />
							<ListItemSecondaryAction>
								<Button variant='outlined' disabled style={{ fontSize: '12px', padding: '6px' }}>{Status[data.deliveryStatus]}</Button>
							</ListItemSecondaryAction>
						</ListItem>
					)
				})}
			</List>
		</Board>
	)
}

