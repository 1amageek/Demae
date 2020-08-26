import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom"
import clsx from "clsx";
import firebase from "firebase"
import "firebase/auth"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank"
import PublicIcon from "@material-ui/icons/Public"
import ViewListIcon from "@material-ui/icons/ViewList"
import StorefrontIcon from "@material-ui/icons/Storefront"
import AccountCircle from "@material-ui/icons/AccountCircle"
import AccountBoxIcon from "@material-ui/icons/AccountBox"
import ImageIcon from "@material-ui/icons/Image"
import MenuIcon from "@material-ui/icons/Menu"
import PlaceIcon from "@material-ui/icons/Place"
import PhotoFilterIcon from "@material-ui/icons/PhotoFilter"
import ListAltIcon from "@material-ui/icons/ListAlt"
import CloudDownloadIcon from "@material-ui/icons/CloudDownload"
import LocalShippingIcon from "@material-ui/icons/LocalShipping"
import { Drawer, AppBar, Toolbar, List, ListItem, ListItemText, Avatar, Divider, Box, MenuItem, Menu, IconButton, Switch, ListItemSecondaryAction, Chip, Badge } from "@material-ui/core"
import Provider, { ProviderDraft, Role } from "models/commerce/Provider"
import { useRoles, useUser, useAdmin, useAdminProvider, useAdminProviderDraft } from "hooks/commerce"
import { useDocumentListen } from "hooks/firestore"
import { useProcessing } from "components/Processing"
import { useSnackbar } from "components/Snackbar"
import { ListItemIcon } from "@material-ui/core"
import Label from "components/Label"
import { useAuthUser } from "hooks/auth"
import { useDialog } from "components/Dialog"
import DataLoading from "components/DataLoading";
import { useAccount } from "hooks/account";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		list: {
			width: 270,
		},
		fullList: {
			width: "auto",
		},
		nested: {
			paddingLeft: theme.spacing(4),
		},
		paper: {
			backgroundColor: "rgba(255, 255, 255, 0.7)",
			backdropFilter: "blur(20px)",
			WebkitBackdropFilter: "blur(20px)",
		}
	}),
);

type Anchor = "top" | "left" | "bottom" | "right";

export default ({ children }: { children: any }) => {
	const classes = useStyles()
	const history = useHistory()
	const [auth] = useAuthUser()
	const [admin] = useAdmin()
	const [provider] = useAdminProvider()
	const [providerDraft] = useAdminProviderDraft()
	const [showProcessing] = useProcessing()
	const [showMessage] = useSnackbar()
	const [showDialog, closeDialog] = useDialog()

	const previewLink = admin ? `/providers/${admin.id}` : "/providers"
	const [state, setState] = React.useState({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	const toggleDrawer = (anchor: Anchor, open: boolean) => (
		event: React.KeyboardEvent | React.MouseEvent,
	) => {
		if (
			event.type === "keydown" &&
			((event as React.KeyboardEvent).key === "Tab" ||
				(event as React.KeyboardEvent).key === "Shift")
		) {
			return;
		}

		setState({ ...state, [anchor]: open });
	};

	const list = (anchor: Anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === "top" || anchor === "bottom",
			})}
			role="presentation"
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<Box
				display="flex"
				flexDirection="column"
				flexGrow={1}
				justifyContent="center"
				alignItems="center"
				fontSize={18}
				fontWeight={600}
				paddingY={3}>
				<Avatar variant="circle" src={providerDraft?.thumbnailImageURL()} style={{ width: "80px", height: "80px" }}>
					<ImageIcon />
				</Avatar>
				{providerDraft && providerDraft.name}
			</Box>

			<Box
				display="flex"
				flexGrow={1}
				justifyContent="space-between"
				alignItems="center"
				padding={2}>
				<Label color={provider !== undefined ? "green" : "red"}>{provider !== undefined ? "ON SALE" : "NOW CLOSED"}</Label>
				<Switch
					edge="end"
					onClick={e => {
						e.stopPropagation()
					}}
					onChange={async (e) => {
						e.stopPropagation()
						if (!admin) return
						showProcessing(true)
						const providerDraft = new ProviderDraft(admin.id)
						if (provider) {
							showProcessing(false)
							const providerClose = firebase.functions().httpsCallable("commerce-v1-provider-close")
							const response = await providerClose()
							const { error } = response.data
							if (error) {
								console.log(error)
								showProcessing(false)
								showMessage("error", `The process failed. Please try again.`)
								return
							}
							showProcessing(false)
							showMessage("success", `${providerDraft.name} is closed.`)
							return
						} else {
							try {
								const providerPublish = firebase.functions().httpsCallable("commerce-v1-provider-publish")
								await providerPublish()
							} catch (error) {
								console.log(error)
								showProcessing(false)
								showDialog("Please enter the required information.", "Please enter the information required to start the service.",
									[
										{
											title: "Cancel",
											handler: closeDialog
										},
										{
											title: "Enter",
											variant: "outlined",
											handler: () => {
												toggleDrawer(anchor, false)
												history.push("/admin/account")
											}
										}
									]
								)
								return
							}
							showProcessing(false)
							showMessage("success", `${providerDraft.name} is now on sale.`)
						}
					}}
					checked={provider !== undefined}
				/>
			</Box>

			<List>
				<ListItem button key={"product"} component={Link} to="/admin/products">
					<ListItemIcon>
						<ListAltIcon />
					</ListItemIcon>
					<ListItemText primary={"Catalog"} />
				</ListItem>
				<List>
					<ListItem className={classes.nested} button key={"published"} component={Link} to="/admin/products/public">
						<ListItemIcon>
							<PhotoFilterIcon />
						</ListItemIcon>
						<ListItemText primary={"Public"} />
					</ListItem>
					<ListItem className={classes.nested} button key={"drafts"} component={Link} to="/admin/products/drafts">
						<ListItemIcon>
							<CheckBoxOutlineBlankIcon />
						</ListItemIcon>
						<ListItemText primary={"Drafts"} />
					</ListItem>
				</List>
			</List>
			<Divider />
			<List>
				<ListItem button key={"orders"} component={Link} to="/admin/orders">
					<ListItemIcon>
						<ViewListIcon />
					</ListItemIcon>
					<ListItemText primary={"Orders"} />
				</ListItem>
				<List>
					<ListItem className={classes.nested} button key={"pickup"} component={Link} to="/admin/orders?deliveryMethod=pickup">
						<ListItemIcon>
							<PlaceIcon />
						</ListItemIcon>
						<ListItemText primary={"Pickup"} />
					</ListItem>
					<ListItem className={classes.nested} button key={"shipping"} component={Link} to="/admin/orders?deliveryMethod=shipping">
						<ListItemIcon>
							<LocalShippingIcon />
						</ListItemIcon>
						<ListItemText primary={"Shipping"} />
					</ListItem>
					<ListItem className={classes.nested} button key={"download"} component={Link} to="/admin/orders?deliveryMethod=download">
						<ListItemIcon>
							<CloudDownloadIcon />
						</ListItemIcon>
						<ListItemText primary={"Download"} />
					</ListItem>
					<ListItem className={classes.nested} button key={"in-store"} component={Link} to="/admin/orders?deliveryMethod=none">
						<ListItemIcon>
							<StorefrontIcon />
						</ListItemIcon>
						<ListItemText primary={"In-Store"} />
					</ListItem>
				</List>
			</List>
			<Divider />
			<List>
				<ListItem button key={"provider"} component={Link} to="/admin/provider">
					<ListItemIcon>
						<StorefrontIcon />
					</ListItemIcon>
					<ListItemText primary={"Shop"} />
				</ListItem>
				{
					(auth && auth.uid === admin?.id) && <AccountListItem />
				}
			</List>
			<Divider />
			<List>
				<ListItem button key={"product"} onClick={() => {
					if (!window.open(previewLink)) window.location.href = previewLink
				}}>
					<ListItemIcon>
						<PublicIcon />
					</ListItemIcon>
					<ListItemText primary={"Preview"} />
				</ListItem>
			</List>
		</div>
	);

	return (
		<>
			<Drawer classes={{ paper: classes.paper }} anchor="left" open={state["left"]} onClose={toggleDrawer("left", false)}>
				{list("left")}
			</Drawer>
			<Box display="flex" style={{ minHeight: "100vh" }} >

				<AppBar
					color="transparent"
					position="fixed"
					variant="outlined"
					style={{
						backgroundColor: "rgba(255, 255, 255, 0.6)",
						backdropFilter: "blur(20px)",
						WebkitBackdropFilter: "blur(20px)",
						borderTop: "none",
						borderLeft: "none",
						borderRight: "none"
					}}
				>
					<Toolbar variant="dense">
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={toggleDrawer("left", true)}
							edge="start"
						>
							<MenuIcon />
						</IconButton>
						<Box fontSize={18} fontWeight={600}>
							{providerDraft && providerDraft.name}
						</Box>
						<div style={{ flexGrow: 1 }}></div>
						<AccountMenu />
					</Toolbar>
				</AppBar>
				<Box display="flex" style={{ minHeight: "100vh", width: "100%" }} >
					{children}
				</Box>
			</Box>
		</>
	);
}

const AccountListItem = () => {

	const [account, isLoading] = useAccount()
	const currently_due: string[] = account?.stripe?.requirements.currently_due ?? []
	const isRequired = currently_due.includes("external_account") || account === undefined
	return (
		<ListItem button key={"provider"} component={Link} to="/admin/account">
			<ListItemIcon>
				<AccountBoxIcon />
			</ListItemIcon>
			<ListItemText primary={"Account"} />
			<ListItemSecondaryAction>
				{isLoading && <DataLoading />}
				{!isLoading && isRequired && <Chip variant="outlined" size="small" color="secondary" label="Required" />}
			</ListItemSecondaryAction>
		</ListItem>
	)
}

const AccountMenu = () => {

	const [user] = useUser()
	const [roles] = useRoles()

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const menuOpen = Boolean(anchorEl)
	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	}
	const handleClose = () => {
		setAnchorEl(null);
	}

	if (user) {
		return (
			<>
				<IconButton
					onClick={handleMenu}
					color="inherit"
				>
					<AccountCircle />
				</IconButton>
				<Menu
					style={{ width: "120px" }}
					anchorEl={anchorEl}
					anchorOrigin={{ vertical: "top", horizontal: "right", }}
					keepMounted
					transformOrigin={{ vertical: "top", horizontal: "right", }}
					open={menuOpen}
					onClose={handleClose}
				>
					{roles.map(role => <UserMenuItem key={role.id} role={role} />)}
					<Divider />
					<MenuItem key={"signout"} onClick={async () => {
						await firebase.auth().signOut()
					}}>SignOut</MenuItem>
				</Menu>
			</>
		)
	} else {
		return (
			<IconButton
				color="inherit"
			>
				<AccountCircle />
			</IconButton>
		)
	}
}

const UserMenuItem = React.forwardRef(({ role }: { role: Role }, ref) => {
	const history = useHistory()
	const [showProcessing] = useProcessing()
	const [showMessage] = useSnackbar()
	const [provider] = useDocumentListen<Provider>(Provider, new Provider(role.id).documentReference)
	return (
		<MenuItem key={role.id} onClick={async () => {
			showProcessing(true)
			const adminAttach = firebase.functions().httpsCallable("commerce-v1-admin-attach")
			try {
				await adminAttach({ providerID: provider!.id })
				showMessage("success", "Change admin")
				history.push(`/admin`)
			} catch (error) {
				showMessage("error", "Error")
				console.error(error)
			}
			showProcessing(false)
		}}>{provider?.name || ""}</MenuItem>
	)
})
