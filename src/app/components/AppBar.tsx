import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import { Link } from 'react-router-dom'
import { Container, AppBar, Toolbar, Box } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useUser } from 'hooks/commerce'


export default ({ title }: { title: string }) => {
	return (
		<AppBar position='static' color='transparent' elevation={0}>
			<Container maxWidth='md' disableGutters>
				<Toolbar>
					<Box display='flex' flexGrow={1} alignItems='center'>
						<Box component={"h1"} fontSize={18} fontWeight={800} flexGrow={1}>
							{title}
						</Box>
						<LoginButton />
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}

const LoginButton = () => {
	const [user] = useUser()
	if (user) {
		return (
			<AccountCircle />
		)
	} else {
		return (
			<Button variant='contained' color='primary' size='small' component={Link} to='/login'>Login</Button>
		)
	}
}
