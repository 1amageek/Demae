import React, { useState, useEffect, useCallback, useContext } from 'react';
import Link from 'next/link'
import Router from 'next/router'
import firebase, { database } from 'firebase';
import 'firebase/auth';
import 'firebase/functions';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import StoreIcon from '@material-ui/icons/Store';
import SettingsIcon from '@material-ui/icons/Settings';
import { UserContext } from 'hooks/commerce'
import { useDataSource, useDataSourceListen, useProvider, useDocumentListen } from 'hooks/commerce';
import * as Commerce from 'models/commerce';
import User, { Role } from 'models/commerce/User';
import Loading from 'components/Loading'
import Modal from '../Modal';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Provider from 'models/commerce/Provider';
import Account from 'models/account/Account';
import Form from './CreateForm'
import Login from 'components/Login'
import Agreement from 'components/agreement'
import DataLoading from 'components/DataLoading';
import { Paper, Grid } from '@material-ui/core';

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

const ProviderList = () => {
	const [user, isLoading] = useContext(UserContext)
	const [roles, isDataLoading] = useDataSourceListen<Role>(Role, user?.roles.collectionReference, isLoading)

	if (isDataLoading) {
		return <DataLoading />
	}

	if (roles.length === 0) {
		return <></>
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
	const [provider, isLoading] = useDocumentListen<Provider>(Provider, new Provider(role.id).documentReference)

	if (isLoading) {
		return (
			<ListItem>
				<DataLoading />
			</ListItem>
		)
	}

	return (
		<ListItem button>
			<ListItemIcon>
				<StoreIcon />
			</ListItemIcon>
			<ListItemText primary={provider!.name} />
			<ListItemSecondaryAction onClick={async () => {
				const adminAttach = firebase.functions().httpsCallable('v1-commerce-admin-attach')
				try {
					await adminAttach({ providerID: provider!.id })
					Router.push(`/admin`)
				} catch (error) {
					console.log(error)
				}
			}}>
				<IconButton>
					<SettingsIcon />
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
	)
}
