
import React, { useState } from 'react'
import firebase from 'firebase'
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
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
import { useHistory, useParams } from 'react-router-dom';
import { Order } from 'models/commerce';
import { ListItemSecondaryAction } from '@material-ui/core';
import { useDataSourceListen, Where, OrderBy } from 'hooks/firestore'
import { DeliveryStatus, PaymentStatus } from 'common/commerce/Types'
import { DeliveryMethod } from 'models/commerce/Product'
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod } from './helper'
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
	const deliveryMethod = useDeliveryMethod()
	const [deliveryStateIndex, setDeliveryStateIndex] = useState(0)
	const [paymentStateIndex, setPaymentStateIndex] = useState(0)
	const [provider, waiting] = useAdminProvider()
	const collectionReference = provider ? provider.orders.collectionReference : undefined
	const wheres = [
		// deliveryMethod ? Where('deliveryMethod', '==', deliveryMethod) : undefined,
		// deliveryStatus ? Where('deliveryStatus', '==', deliveryStatus) : undefined,
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
		<Box>aaaaaa こんにちは</Box>
	)

	// return (
	// 	<Board hideBackArrow header={
	// 		<>
	// 			<Box>Order</Box>
	// 			<Box flexGrow={1} />
	// 			<Tooltip title='asc' onClick={() => {
	// 				setOrderBy('asc')
	// 			}}>
	// 				<IconButton>
	// 					<KeyboardArrowDownIcon color='inherit' />
	// 				</IconButton>
	// 			</Tooltip>
	// 			<Tooltip title='desc' onClick={() => {
	// 				setOrderBy('desc')
	// 			}}>
	// 				<IconButton>
	// 					<KeyboardArrowUpIcon color='inherit' />
	// 				</IconButton>
	// 			</Tooltip>
	// 		</>
	// 	}>
	// 		<List>
	// 			{orders.map(data => {
	// 				const orderedDate = Dayjs(data.createdAt.toDate())
	// 				return (
	// 					<ListItem key={data.id} button alignItems="flex-start" selected={orderID === data.id} onClick={() => {
	// 						history.push(`/admin/orders/${data.id}` + (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : ''))
	// 					}}>
	// 						<ListItemAvatar>
	// 							<Avatar variant="rounded" src={data.imageURLs()[0]}>
	// 								<ImageIcon />
	// 							</Avatar>
	// 						</ListItemAvatar>
	// 						<ListItemText primary={
	// 							<>
	// 								<Typography>
	// 									{data.title}
	// 								</Typography>
	// 								<Typography variant="subtitle2">
	// 									{`ID: ${data.id}`}
	// 								</Typography>
	// 								<Box fontSize={12}>
	// 									{orderedDate.format('YYYY-MM-DD HH:mm:ss')}
	// 								</Box>
	// 								<Box display='flex'>
	// 									<Label color='gray' fontSize={12}>{DeliveryStatusLabel[data.deliveryStatus]}</Label>
	// 									<Label color='gray' fontSize={12}>{PaymentStatusLabel[data.paymentStatus]}</Label>
	// 								</Box>
	// 							</>
	// 						} />
	// 					</ListItem>
	// 				)
	// 			})}
	// 		</List>
	// 	</Board>
	// )
}

