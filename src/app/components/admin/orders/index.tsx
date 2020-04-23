
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Box, Hidden } from '@material-ui/core';
import { useProviderProduct, ProviderProductProvider, ProviderProductSKUProvider } from 'hooks/commerce';

export default (props: any) => {
	const { orderID } = props.match.params

	return (
		<Box height='100%'>

		</Box>
	)
}
