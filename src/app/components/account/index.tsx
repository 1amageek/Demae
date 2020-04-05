import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Router from 'next/router'
import firebase from 'firebase';
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
import { UserContext } from 'context'
import { useDataSource } from 'hooks/commerce';
import * as Commerce from 'models/commerce';
import { Role } from 'models/commerce/User';
import Loading from 'components/Loading'
import Modal from '../Modal';
import Provider from 'models/commerce/Provider';
import Account from 'models/account/Account';
import Form from './CreateForm'
import Login from 'components/Login'
import Agreement from 'components/agreement'

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
	return <ListItem button component='a' {...props} />;
}

export default () => {
	const [open, setOpen] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)
	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};
	return (
		<UserContext.Consumer>
			{(auth) => {
				if (auth) {
					const provider = new Provider(auth.uid)
					const account = new Account(auth.uid)
					return (
						<>
							<List component='nav' aria-label='main mailbox folders'>
								<ListItem button>
									<ListItemIcon>
										<ViewListIcon />
									</ListItemIcon>
									<ListItemText primary='Purchase history' />
								</ListItem>
							</List>
							<ProviderList uid={auth.uid} handleOpen={handleOpen} />
							<Divider />
							<List component='nav' aria-label='secondary mailbox folders'>
								<ListItemLink onClick={async () => {
									await firebase.auth().signOut()
								}}>
									<ListItemText primary='SignOut' />
								</ListItemLink>
							</List>
							<Agreement
								open={open}
								onClose={handleClose}
								onNext={() => {
									handleClose()
									setModalOpen(true)
								}}
							/>
							<Modal
								open={modalOpen}
								onClose={() => { setModalOpen(false) }}
							>
								<Form uid={auth.uid} provider={provider} account={account} />
							</Modal>
						</>
					)
				} else {
					return <Login />
				}
			}}
		</UserContext.Consumer>
	);
}

const ProviderList = ({ uid, handleOpen }: { uid: string, handleOpen: () => void }) => {
	const user = new Commerce.User(uid)
	const [data, isDataLoading] = useDataSource<Role>(Role, user.roles.collectionReference)
	const [providers, setProviders] = useState<Provider[]>([])
	const [isLoading, setLoading] = useState(isDataLoading)
	const [isAttaching, setAttaching] = useState(false)

	useEffect(() => {
		(async () => {
			if (!isDataLoading) {
				setLoading(true)
				const providers = await Promise.all(data.map(async role => {
					return Provider.get<Provider>(role.id)
				}))
				const filterd = providers.filter(value => !!value) as Provider[]
				setProviders(filterd)
				setLoading(false)
			}
			setLoading(false)
		})()
	}, [data.length])

	if (isLoading) {
		return <Loading />
	} else {
		if (providers.length === 0) {
			return (
				<ListItemLink onClick={handleOpen}>
					<ListItemText primary='Add Provider' />
				</ListItemLink>
			)
		} else {
			return (
				<>
					<List component='nav' aria-label='main mailbox folders'>
						{providers
							.map(provider => {
								return (
									<Link href={`/providers/${provider.id}`} key={provider.id}>
										<ListItem button>
											<ListItemIcon>
												<StoreIcon />
											</ListItemIcon>
											<ListItemText primary={provider.name} />
											<ListItemSecondaryAction onClick={async () => {
												setAttaching(true)
												const adminAttach = firebase.functions().httpsCallable('v1-commerce-admin-attach')
												try {
													await adminAttach({ providerID: provider.id })
													Router.push(`/admin`)
												} catch (error) {
													console.log(error)
												}
												setAttaching(false)
											}}>
												<IconButton edge='end' aria-label='comments'>
													<SettingsIcon />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
									</Link>
								)
							})}
					</List>
					{isAttaching && <Loading />}
				</>
			)
		}
	}
}
