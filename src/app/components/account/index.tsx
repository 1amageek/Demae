import React, { useState, useEffect, useCallback, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom'
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
import { Paper, Grid, Typography, Box } from '@material-ui/core';
import Agreement from './agreement'
import Modal from 'components/Modal'
import Login from 'components/Login'
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
						<ListItem button component={Link} to={`/account/orders`}>
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
	const [modalOpen, setModalOpen] = useState(false)
	const [Dialog, openDialog] = useDialog(Agreement, () => {
		openDialog(false)
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
						console.log(user)
						if (user) {
							openDialog(true)
						} else {
							setModalOpen(true)
						}
					}}>
						<ListItemIcon>
							<StorefrontIcon />
						</ListItemIcon>
						<ListItemText primary={'Add your store'} />
					</ListItem>
				</List>
				<Dialog />
				<Modal
					open={modalOpen}
					onClose={() => {
						setModalOpen(false)
					}}>
					<Paper>
						<Box paddingX={3} paddingY={2} fontSize={18} sizeWidth='fontWeightMedium'>
							Sign in to create a new store.
						</Box>
						<Login />
					</Paper>
				</Modal>
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
	const [ErrorDialog, openDailog] = useErrorDialog('Error')
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
						Router.push(`/admin`)
					} catch (error) {
						openDailog(true)
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
