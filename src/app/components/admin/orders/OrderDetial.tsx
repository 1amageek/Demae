
import React, { useState } from 'react'
import firebase from 'firebase'
import { DeliveryStatus } from 'common/commerce/Types'
import { Typography, Box, Paper } from '@material-ui/core';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import { List, ListItem, ListItemText, ListItemAvatar, ListItemIcon, Divider } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useAdminProvider, useAdminProviderOrder, } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { SKU } from 'models/commerce';
import { useDrawer } from 'components/Drawer';
import { useSnackbar } from 'components/Snackbar';


export default ({ orderID }: { orderID?: string }) => {
	const [provider] = useAdminProvider()
	const [order, isLoading] = useAdminProviderOrder(orderID)
	const history = useHistory()
	const [showDrawer, onClose] = useDrawer()
	const [showSnackbar] = useSnackbar()

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

					if (status === 'in_transit') {
						showDrawer(<ActionSheet onNext={async () => {



							deliveryStatus.setValue(status)
							if (!order) return
							order.deliveryStatus = status
							await order.save()
							onClose()
						}} onClose={onClose} />)
					} else {
						deliveryStatus.setValue(status)
						if (!order) return
						order.deliveryStatus = status
						await order.save()
					}
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

const ActionSheet = ({ onNext, onClose }: { onNext: () => void, onClose: () => void }) => {
	return (
		<Paper>
			<Box>
				<Box fontSize={16} fontWeight={600} padding={2} paddingBottom={0} color="text.secondary">
					Complete the delivery process.
				</Box>
				<Box fontSize={16} fontWeight={400} paddingX={2} paddingBottom={2} color="text.secondary">
					The payment is executed by completing the delivery process.
				</Box>
				<List component="nav">
					<ListItem button onClick={async () => {
						onNext()
					}}>
						<ListItemText primary="OK" />
					</ListItem>
				</List>
				<Divider />
				<List component="nav">
					<ListItem button onClick={onClose}>
						<ListItemText primary="Cancel" />
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
