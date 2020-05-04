import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom'
import firebase, { database } from 'firebase';
import 'firebase/auth';
import 'firebase/functions';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import StorefrontIcon from '@material-ui/icons/Storefront';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import { Container } from '@material-ui/core'
import { useDataSourceListen, useDocumentListen } from 'hooks/firestore';
import User, { Role } from 'models/commerce/User';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Provider from 'models/commerce/Provider';
import DataLoading from 'components/DataLoading';
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import { useDialog } from 'components/Dialog'
import { useProcessing } from 'components/Processing';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useUser } from 'hooks/commerce'
import { useAccount } from 'hooks/account'

export default () => {

	const [account, isAccountLoading] = useAccount()

	return (
		<Container maxWidth='sm'>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Paper>
						<List>
							<ListItem button component={Link} to={`/account/orders`}>
								<ListItemIcon>
									<ViewListIcon />
								</ListItemIcon>
								<ListItemText primary='Purchase history' />
							</ListItem>
							<ListItem button component={Link} to={account ? '/account/payments' : '/account/create'} disabled={isAccountLoading}>
								<ListItemIcon>
									<AccountBoxIcon />
								</ListItemIcon>
								<ListItemText primary={account ? 'Account' : 'Create new account'} />
								<ListItemSecondaryAction>
									{isAccountLoading && <CircularProgress size={20} />}
								</ListItemSecondaryAction>
							</ListItem>
						</List>
					</Paper>
				</Grid>
				<Grid item xs={12}>
					<Paper>
						<ProviderList />
					</Paper>
				</Grid>
				<Grid item xs={12}>
					<List>
						<ListItem button>
							<ListItemIcon>
								<MeetingRoomIcon />
							</ListItemIcon>
							<ListItemText primary='SignOut' color='text.secondary' onClick={async () => {
								await firebase.auth().signOut()
							}} />
						</ListItem>
					</List>
				</Grid>
			</Grid>
		</Container>
	)
}


const ProviderList = () => {
	const history = useHistory()
	const [user, isLoading] = useUser()
	const ref = user?.roles.collectionReference
	const [roles, isDataLoading] = useDataSourceListen<Role>(Role, { path: ref?.path }, isLoading)

	if (isDataLoading) {
		return <DataLoading />
	}

	if (roles.length === 0) {
		return (
			<List>
				<ListItem button onClick={() => {
					console.log(user)
				}}>
					<ListItemIcon>
						<StorefrontIcon />
					</ListItemIcon>
					<ListItemText primary={'Add your store'} />
				</ListItem>
			</List>
		)
	}

	return (
		<List>
			{roles.map(role => {
				return <ProviderListItem role={role} />
			})}
		</List>
	)
}

const ProviderListItem = ({ role }: { role: Role }) => {
	const history = useHistory()
	const [provider, isLoading] = useDocumentListen<Provider>(Provider, new Provider(role.id).documentReference)
	const [setDialog] = useDialog()
	const [setProcessing] = useProcessing()
	if (isLoading) {
		return (
			<ListItem>
				<DataLoading />
			</ListItem>
		)
	}

	return (
		<>
			<ListItem button>
				<ListItemIcon>
					<StorefrontIcon />
				</ListItemIcon>
				<ListItemText primary={provider!.name} />
				<ListItemSecondaryAction onClick={async () => {
					setProcessing(true)
					const adminAttach = firebase.functions().httpsCallable('v1-commerce-admin-attach')
					try {
						await adminAttach({ providerID: provider!.id })
						history.push('/admin')
					} catch (error) {
						setDialog('Error', 'Error', [{
							title: 'OK'
						}])
						console.error(error)
					}
					setProcessing(false)
				}}>
					<IconButton>
						<SettingsIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
		</>
	)
}
