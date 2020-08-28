import React, { useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom"
import firebase from "firebase";
import "firebase/auth";
import "firebase/functions";
import List from "@material-ui/core/List";
import CircularProgress from "@material-ui/core/CircularProgress";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import StorefrontIcon from "@material-ui/icons/Storefront";
import IconButton from "@material-ui/core/IconButton";
import ViewListIcon from "@material-ui/icons/ViewList";
import SettingsIcon from "@material-ui/icons/Settings";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { Container } from "@material-ui/core"
import { useDataSourceListen, useDocumentListen } from "hooks/firestore";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import { ProviderDraft, Role } from "models/commerce/Provider";
import DataLoading from "components/DataLoading";
import { Paper, Grid } from "@material-ui/core";
import { useDialog } from "components/Dialog"
import { useProcessing } from "components/Processing";
import { useModal } from "components/Modal"
import { useUser } from "hooks/commerce"
import { useAccount } from "hooks/account"
import Account from "models/account/Account"
import Login from "components/Login";

export default () => {

	const [account, isAccountLoading] = useAccount()
	const history = useHistory()
	const [setProgress] = useProcessing()
	const [showDialog] = useDialog()
	const [showModal, closeModal] = useModal()

	return (
		<Container maxWidth="sm">
			<Typography variant="h1" gutterBottom>Account</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Paper>
						<List>
							<ListItem button component={Link} to={`/account/orders`}>
								<ListItemIcon>
									<ViewListIcon />
								</ListItemIcon>
								<ListItemText primary="Purchase history" />
							</ListItem>
							<ListItem button disabled={isAccountLoading} onClick={() => {
								const currentUser = firebase.auth().currentUser
								if (currentUser) {
									if (account) {
										history.push("/account/payments")
									} else {
										history.push("/account/create")
									}
								} else {
									showDialog("Welcome 🎉", "We support your business. Please log in first.", [
										{
											title: "OK",
											handler: () => {
												showModal(<Login onNext={async (user) => {
													setProgress(true)
													try {
														const account = await Account.get<Account>(user.id)
														if (!account) {
															setProgress(false)
															closeModal()
															history.push("/account/create")
														}
													} catch (error) {
														setProgress(false)
														closeModal()
														history.push("/account/create")
														console.error(error)
													}
												}} />)
											}
										}
									])
								}
							}}>
								<ListItemIcon>
									<AccountBoxIcon />
								</ListItemIcon>
								<ListItemText primary={account ? "Account" : "Create new account"} />
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
							<ListItemText primary="SignOut" color="text.secondary" onClick={async () => {
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
	const ref = user?.providers.collectionReference
	const [roles, isDataLoading] = useDataSourceListen<Role>(Role, { path: ref?.path }, isLoading)
	const [showDialog] = useDialog()
	const [showModal, closeModal] = useModal()

	if (isDataLoading) {
		return <DataLoading />
	}

	if (roles.length === 0) {
		return (
			<List>
				<ListItem button onClick={() => {
					const currentUser = firebase.auth().currentUser
					if (currentUser) {
						history.push("/provider/create")
					} else {
						showDialog("Welcome 🎉", "We support your business. Please log in first.", [
							{
								title: "OK",
								handler: () => {
									showModal(<Login onNext={() => {
										closeModal()
									}} />)
								}
							}
						])
					}
				}}>
					<ListItemIcon>
						<StorefrontIcon />
					</ListItemIcon>
					<ListItemText primary={"Add your Shop"} />
				</ListItem>
			</List>
		)
	}

	return (
		<List>
			{roles.map(role => {
				return <ProviderListItem key={role.id} role={role} />
			})}
		</List>
	)
}

const ProviderListItem = ({ role }: { role: Role }) => {
	const [provider, isLoading] = useDocumentListen<ProviderDraft>(ProviderDraft, new ProviderDraft(role.id).documentReference)
	const [showDialog] = useDialog()
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
			<ListItem button component={Link} to={`/providers/${role.id}`}>
				<ListItemIcon>
					<StorefrontIcon />
				</ListItemIcon>
				<ListItemText primary={provider!.name} />
				<ListItemSecondaryAction onClick={async () => {
					setProcessing(true)
					const adminAttach = firebase.functions().httpsCallable("commerce-v1-admin-attach")
					try {
						await adminAttach({ providerID: provider!.id })
						await firebase.auth().currentUser?.getIdTokenResult(true)
						const url = "/admin"
						if (!window.open(url)) window.location.href = url
					} catch (error) {
						showDialog("Error", "Error", [{
							title: "OK"
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
