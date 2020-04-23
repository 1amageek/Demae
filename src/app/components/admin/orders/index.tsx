
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden } from '@material-ui/core';
import { useProviderProduct, ProviderProductProvider, ProviderProductSKUProvider } from 'hooks/commerce';
import OrderList from './OrderList'

export default (props: any) => {
	const { orderID } = props.match.params

	return (
		<Box height='100%'>
			<Box py={2}>
				<Breadcrumbs>
					<Link to='/admin/orders'>Orders</Link>
					{orderID && <Link to={`/admin/orders/${orderID}`}>{orderID}</Link>}
				</Breadcrumbs>
			</Box>

			<Grid container alignItems="stretch" spacing={0} style={{ width: '100%' }}>
				<Grid item xs>
					<OrderList orderID={orderID} />
				</Grid>
			</Grid>
		</Box>
	)
}
