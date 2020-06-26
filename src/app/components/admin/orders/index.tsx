
import React, { useState } from 'react'
import { Link, useHistory, useParams, useLocation } from 'react-router-dom'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden, Typography } from '@material-ui/core';
import { AdminProviderOrderProvider } from 'hooks/commerce';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import OrderList from './OrderList'
import OrderDetial from './OrderDetial'
import List from './List'
import { DeliveryStatus, PaymentStatus } from 'common/commerce/Types'
import { DeliveryMethod } from 'models/commerce/Product'
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod } from './helper'

type DeliveryTab = {
	label: string,
	value?: DeliveryStatus
}

const DeliveryTabs: DeliveryTab[] = [
	{ label: "TODO", value: "preparing_for_delivery" },
	{ label: "Out for delivery", value: "out_for_delivery" },
	{ label: "Complete", value: "in_transit" },
	{ label: "Pending", value: "pending" },
	{ label: "All", value: undefined }
]

const DeliveryStatusLabel = {
	none: 'Received',
	pending: 'pending',
	delivering: 'Delivering',
	delivered: 'Delivered'
}

const PaymentStatus = ['none', 'processing', 'succeeded', 'payment_failed']
const PaymentStatusLabel: { [key in PaymentStatus]: string } = {
	none: 'Received',
	processing: 'processing',
	succeeded: 'succeeded',
	payment_failed: 'payment_failed'
}

export default () => {
	const { orderID } = useParams()
	const deliveryMethod = useDeliveryMethod()
	const [deliveryState, setDeliveryState] = useState(0)
	const [paymentState, setPaymentState] = useState(0)
	const deliveryMethodQuery = (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : '')

	const handleChangeDeliveryStatus = (event: React.ChangeEvent<{}>, newValue: number) => {
		setDeliveryState(newValue)
	}
	const handleChangePaymentStatus = (event: React.ChangeEvent<{}>, newValue: number) => {
		setPaymentState(newValue)
	}

	const tabs = deliveryStatusesForDeliveryMethod(deliveryMethod)

	return (
		<AdminProviderOrderProvider id={orderID}>
			<Box>
				<Typography variant='h1'>Order</Typography>
				<Box py={2}>
					<Breadcrumbs>
						<Link to={'/admin/orders' + deliveryMethodQuery}>Orders</Link>
						{orderID && <Link to={`/admin/orders/${orderID}` + deliveryMethodQuery}>{orderID}</Link>}
					</Breadcrumbs>
				</Box>
				<AppBar position="static" color='inherit' elevation={1}>
					<Tabs value={deliveryState} onChange={handleChangeDeliveryStatus}>
						{tabs.map((tab, index) => {
							return <Tab key={index} label={tab.label} id={`${index}`} />
						})}
					</Tabs>
				</AppBar>
				<Content orderID={orderID} deliveryMethod={deliveryMethod} deliveryStatus={DeliveryTabs[deliveryState].value} paymentStatus={PaymentStatus[paymentState]} />
			</Box>
		</AdminProviderOrderProvider>
	)
}


const Content = ({ deliveryMethod, deliveryStatus, paymentStatus, orderID }: { deliveryMethod?: string, deliveryStatus?: string, paymentStatus?: string, orderID?: string }) => {
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down('sm'));

	if (matches) {
		if (orderID) {
			return (
				<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
					<Grid item xs={12}>
						<OrderDetial orderID={orderID} />
					</Grid>
				</Grid>
			)
		}

		return (
			<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
				<Grid item xs={12}>
					<List />
					{/* <OrderList orderID={orderID} deliveryMethod={deliveryMethod} deliveryStatus={deliveryStatus} paymentStatus={paymentStatus} /> */}
				</Grid>
			</Grid>
		)
	}

	return (
		<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
			<Grid item xs={12} md={4}>
				<List />
				{/* <OrderList orderID={orderID} deliveryMethod={deliveryMethod} deliveryStatus={deliveryStatus} paymentStatus={paymentStatus} /> */}
			</Grid>
			<Grid item xs={12} md={8}>
				<OrderDetial orderID={orderID} />
			</Grid>
		</Grid>
	)
}
