import React from 'react'
import { Box, Paper, Grid, Typography } from '@material-ui/core';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

export default () => {
	return (
		<Paper>
			<Box padding={4} fontWeight="fontWeightBold" fontSize={25} display='flex' justifyContent='center'>
				Not Found
			</Box>
		</Paper >
	)
}
