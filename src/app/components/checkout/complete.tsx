import React from 'react'
import { Link } from 'react-router-dom'
import { Paper, Box, AppBar, Toolbar, Button, Typography } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export default () => {
	return (
		<Paper>
			<Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' padding={8} fontSize={40} fontWeight={800}>
				<CheckCircleIcon style={{ fontSize: '80px', color: '#00e34e' }} />
				Thank you.
			</Box>
			<Box display='flex' justifyContent='center' alignItems='center' padding={2} fontSize={20} fontWeight={400}>
				<Link to="/account/orders"> Check your order</Link>
			</Box>
		</Paper>
	)
}
