
import React, { useState } from 'react'
import firebase from 'firebase'
import { DeliveryStatus } from 'common/commerce/Types'
import { File as StorageFile } from '@1amageek/ballcap'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
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
import Product from 'models/commerce/Product'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useAdminProvider, useAdminProviderOrder, } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { SKU } from 'models/commerce';


export default ({ orderID }: { orderID?: string }) => {
	const [provider] = useAdminProvider()
	const [order, isLoading] = useAdminProviderOrder(orderID)
	const history = useHistory()

	const deliveryStatus = useSelect({
		initValue: order?.deliveryStatus, inputProps: {
			menu: [
				{
					label: 'Todo',
					value: 'preparing_for_delivery'
				},
				{
					label: 'Out for delivery',
					value: 'out_for_delivery'
				},
				{
					label: 'Completed',
					value: 'in_transit'
				},
				{
					label: 'Pending',
					value: 'pending'
				}
			]
		}
	})

	if (isLoading) {
		return (
			<Board>
				<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500} justifyContent='center' alignItems='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	if (!order) {
		return (
			<Board>
			</Board>
		)
	}

	return (
		<Board header={
			<>
				ID: {orderID}
				<Box flexGrow={1} />
				<Select disabled={deliveryStatus.value === 'none'} {...deliveryStatus} onChange={async (e) => {
					e.preventDefault()
					const status = String(e.target.value) as DeliveryStatus
					deliveryStatus.setValue(status)

					if (!order) return
					order.deliveryStatus = status
					await order.save()
					console.log(deliveryStatus.value, e.target.value)
				}} />
			</>
		} onClick={(e) => {
			history.push('/admin/orders')
		}}>
			<Box>
				<Box fontSize={18} fontWeight={600} padding={2}>
					Shipping Address
				</Box>
				<Box padding={2}>
					<Typography>{order?.shipping?.format(['postal_code', 'line1', 'line2', 'city', 'state'])}</Typography>
				</Box>
				<Box fontSize={18} fontWeight={600} padding={2}>
					Order items
				</Box>
				<List>
					{order?.items.map(data => {
						const image = (data.imageURLs().length > 0) ? data.imageURLs()[0] : undefined
						return (
							<ListItem key={data.skuReference?.path}>
								<ListItemAvatar>
									<Avatar variant="rounded" src={image} >
										<ImageIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={data.name} secondary={
									<Typography>Qty: {data.quantity.toString()}</Typography>
								} />
							</ListItem>
						)
					})}
				</List>
			</Box>
		</Board>
	)
}

