
import React, { useState } from 'react'
import { Link, useHistory, useParams, useLocation } from 'react-router-dom'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden } from '@material-ui/core';
import { AdminProviderOrderProvider } from 'hooks/commerce';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import OrderList from './OrderList'
import OrderDetial from './OrderDetial'
import { DeliveryStatus } from 'common/commerce/Types'

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

const PaymentStatus = ['none', 'rejected', 'authorized', 'paid', 'cancelled', 'failure', 'cancel_failure']
const PaymentStatusLabel = {
	none: 'Received',
	rejected: 'rejected',
	authorized: 'authorized',
	paid: 'paid',
	cancelled: 'cancelled',
	failure: 'failure',
	cancel_failure: 'cancel failure'
}

export default () => {
	const { orderID } = useParams()
	const history = useHistory()
	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const deliveryMethod = params.get('deliveryMethod') || undefined
	const [deliveryState, setDeliveryState] = useState(0)
	const [paymentState, setPaymentState] = useState(0)
	const handleChangeDeliveryStatus = (event: React.ChangeEvent<{}>, newValue: number) => {
		setDeliveryState(newValue)
	}
	const handleChangePaymentStatus = (event: React.ChangeEvent<{}>, newValue: number) => {
		setPaymentState(newValue)
	}

	return (
		<AdminProviderOrderProvider id={orderID}>
			<Box>
				<Box py={2}>
					<Breadcrumbs>
						<Link to='/admin/orders'>Orders</Link>
						{orderID && <Link to={`/admin/orders/${orderID}`}>{orderID}</Link>}
					</Breadcrumbs>
				</Box>
				<AppBar position="static" color='inherit' elevation={1}>
					<Tabs value={deliveryState} onChange={handleChangeDeliveryStatus}>
						{DeliveryTabs.map((tab, index) => {
							return <Tab key={index} label={tab.label} id={`${index}`} />
						})}
					</Tabs>
				</AppBar>
				{/* <AppBar position="static" color='inherit' elevation={1}>
					<Tabs value={paymentState} onChange={handleChangePaymentStatus}>
						{PaymentStatus.map(value => {
							return <Tab key={value} label={PaymentStatusLabel[value]} id={value} />
						})}
					</Tabs>
				</AppBar> */}
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
					<OrderList orderID={orderID} deliveryStatus={deliveryStatus} paymentStatus={paymentStatus} />
				</Grid>
			</Grid>
		)
	}

	return (
		<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
			<Grid item xs={12} md={4}>
				<OrderList orderID={orderID} deliveryStatus={deliveryStatus} paymentStatus={paymentStatus} />
			</Grid>
			<Grid item xs={12} md={8}>
				<OrderDetial orderID={orderID} />
			</Grid>
		</Grid>
	)
}
