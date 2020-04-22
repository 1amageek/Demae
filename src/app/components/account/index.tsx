import React, { useState, useEffect, useCallback, useContext } from 'react';
import { withRouter } from 'react-router-dom'
import Router from 'next/router'
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
import { UserContext } from 'hooks/commerce'
import { useDataSourceListen, useDocumentListen } from 'hooks/firestore';
import User, { Role } from 'models/commerce/User';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Provider from 'models/commerce/Provider';
import DataLoading from 'components/DataLoading';
import { Paper, Grid } from '@material-ui/core';
import Agreement from './agreement'
import { useDialog, DialogProps } from 'components/Dialog'
import { useErrorDialog } from 'components/ErrorDialog';
import { useProcessing } from 'components/Processing';

export default () => {
	const [user, isLoading, error] = useContext(UserContext)
	if (isLoading) {
		return <DataLoading />
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Paper>
					<List>
						<ListItem button>
							<ListItemIcon>
								<ViewListIcon />
							</ListItemIcon>
							<ListItemText primary='Purchase history' />
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
	)
}


const ProviderList = withRouter(props => {
	const [user, isLoading] = useContext(UserContext)
	const ref = user?.roles.collectionReference
	const [roles, isDataLoading] = useDataSourceListen<Role>(Role, { path: ref?.path }, isLoading)
	const [setOpen, Dialog] = useDialog(Agreement, () => {
		setOpen(false)
		props.history.push('/account/new')
	})
	if (isDataLoading) {
		return <DataLoading />
	}

	if (roles.length === 0) {
		return (
			<>
				<List>
					<ListItem button onClick={() => {
						setOpen(true)
					}}>
						<ListItemIcon>
							<StorefrontIcon />
						</ListItemIcon>
						<ListItemText primary={'Add your store'} />
					</ListItem>
				</List>
				<Dialog />
			</>
		)
	}

	return (
		<List>
			{roles.map(role => {
				return <ProviderListItem role={role} />
			})}
		</List>
	)
})

const ProviderListItem = ({ role }: { role: Role }) => {
	const [provider, isLoading] = useDocumentListen<Provider>(Provider, new Provider(role.id).documentReference)
	const [setOpen, ErrorDialog] = useErrorDialog('Error')
	const [isProcessing, setProcessing] = useProcessing()
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
						Router.push(`/admin`)
					} catch (error) {
						setOpen(true)
						console.error(error)
					}
					setProcessing(false)
				}}>
					<IconButton>
						<SettingsIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ErrorDialog />
		</>
	)
}
