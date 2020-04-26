import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';


export default ({ header, children }: { header?: React.ReactNode, children: any }) => {
	return (
		<Paper style={{ minHeight: '400px' }} square >
			<AppBar position="static" color="default" elevation={0}>
				<Toolbar>
					{header}
				</Toolbar>
			</AppBar>
			{children}
		</Paper>
	)
}
