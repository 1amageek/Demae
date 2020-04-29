
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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


const Status = ['none', 'pending', 'delivering', 'delivered']
const StatusLabel = {
	none: 'Received',
	pending: 'pending',
	delivering: 'Delivering',
	delivered: 'Delivered'
}

export default (props: any) => {
	const { orderID } = props.match.params
	const [value, setValue] = useState(0)
	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setValue(newValue);
	};

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
					<Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
						{Status.map(value => {
							return <Tab label={StatusLabel[value]} id={value} />
						})}
					</Tabs>
				</AppBar>
				<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
					<Content orderID={orderID} status={Status[value]} />
				</Grid>
			</Box>
		</AdminProviderOrderProvider>
	)
}


const Content = ({ status, orderID }: { status: string, orderID?: string }) => {
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down('sm'));

	if (matches) {
		if (orderID) {
			return (
				<Grid item xs={12}>
					<OrderDetial orderID={orderID} />
				</Grid>
			)
		}

		return (
			<Grid item xs={12}>
				<OrderList orderID={orderID} status={status} />
			</Grid>
		)
	}

	return (
		<>
			<Grid item xs={12} md={4} alignItems='stretch'>
				<OrderList orderID={orderID} status={status} />
			</Grid>
			<Grid item xs={12} md={8}>
				<OrderDetial orderID={orderID} />
			</Grid>
		</>
	)
}
