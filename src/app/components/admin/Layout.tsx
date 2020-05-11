import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom'
import clsx from 'clsx';
import firebase from 'firebase'
import 'firebase/auth'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import PublicIcon from '@material-ui/icons/Public';
import ViewListIcon from '@material-ui/icons/ViewList';
import StorefrontIcon from '@material-ui/icons/Storefront';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import { Drawer, CssBaseline, AppBar, Toolbar, List, ListItem, ListItemText, Typography, Divider, Box, MenuItem, Menu, IconButton } from '@material-ui/core';
import Provider, { Role } from 'models/commerce/Provider'
import { useRoles, useUser, useAdminProvider } from 'hooks/commerce'
import { useDocumentListen } from 'hooks/firestore'
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import { ListItemIcon } from '@material-ui/core';

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
			height: '100%'
		},
		appBar: {
			transition: theme.transitions.create(['margin', 'width'], {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen,
			}),
		},
		appBarShift: {
			width: `calc(100% - ${drawerWidth}px)`,
			marginLeft: drawerWidth,
			transition: theme.transitions.create(['margin', 'width'], {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
		},
		tooBar: {
			flexGrow: 1
		},
		menuButton: {
			marginRight: theme.spacing(2),
		},
		hide: {
			display: 'none',
		},
		drawer: {
			width: drawerWidth,
			flexShrink: 0,
		},
		drawerPaper: {
			width: drawerWidth,
		},
		drawerHeader: {
			display: 'flex',
			alignItems: 'center',
			padding: theme.spacing(0, 1),
			// necessary for content to be below app bar
			...theme.mixins.toolbar,
			justifyContent: 'flex-end',
		},
		content: {
			flexGrow: 1,
			transition: theme.transitions.create('margin', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen,
			}),
			marginLeft: -drawerWidth,
		},
		contentShift: {
			transition: theme.transitions.create('margin', {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
			marginLeft: 0,
		},
		box: {
			minHeight: '100vh'
		},
	}),
);

export default ({ children }: { children: any }) => {
	const classes = useStyles()
	const [provider] = useAdminProvider()
	const theme = useTheme()
	const [open, setOpen] = useState(false)

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const previewLink = provider ? `/providers/${provider.id}` : '/providers'

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar
				color='inherit'
				position='fixed'
				elevation={0}
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open,
				})}
			>
				<Toolbar className={classes.tooBar}>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						onClick={handleDrawerOpen}
						edge='start'
						className={clsx(classes.menuButton, open && classes.hide)}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant='h6' noWrap>
						{provider && provider.name}
					</Typography>
					<div style={{ flexGrow: 1 }}></div>
					<AccountMenu />
				</Toolbar>
			</AppBar>
			<Drawer
				className={classes.drawer}
				variant='persistent'
				anchor='left'
				open={open}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<div className={classes.drawerHeader}>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
				</div>
				<Divider />
				<List>
					<ListItem button key={'product'} component={Link} to='/admin/products'>
						<ListItemIcon>
							<CheckBoxOutlineBlankIcon />
						</ListItemIcon>
						<ListItemText primary={'Product'} />
					</ListItem>
					<ListItem button key={'orders'} component={Link} to='/admin/orders'>
						<ListItemIcon>
							<ViewListIcon />
						</ListItemIcon>
						<ListItemText primary={'Orders'} />
					</ListItem>
					<ListItem button key={'provider'} component={Link} to='/admin/provider'>
						<ListItemIcon>
							<StorefrontIcon />
						</ListItemIcon>
						<ListItemText primary={'Shop'} />
					</ListItem>
				</List>
				<Divider />
				<List>
					<ListItem button key={'product'} onClick={() => {
						window.location.href = previewLink
					}}>
						<ListItemIcon>
							<PublicIcon />
						</ListItemIcon>
						<ListItemText primary={'Preview'} />
					</ListItem>
				</List>
			</Drawer>
			<main
				className={clsx(classes.content, {
					[classes.contentShift]: open,
				})}
			>
				<div className={classes.drawerHeader} />
				<Box className={classes.box} >
					{children}
				</Box>
			</main>
		</div>
	);
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
					color='inherit'
				>
					<AccountCircle />
				</IconButton>
				<Menu
					style={{ width: '120px' }}
					anchorEl={anchorEl}
					anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
					keepMounted
					transformOrigin={{ vertical: 'top', horizontal: 'right', }}
					open={menuOpen}
					onClose={handleClose}
				>
					{roles.map(role => <UserMenuItem key={role.id} role={role} />)}
					<Divider />
					<MenuItem key={'signout'} onClick={async () => {
						await firebase.auth().signOut()
					}}>SignOut</MenuItem>
				</Menu>
			</>
		)
	} else {
		return (
			<IconButton
				color='inherit'
			>
				<AccountCircle />
			</IconButton>
		)
	}
}

const UserMenuItem = React.forwardRef(({ role }: { role: Role }, ref) => {
	const history = useHistory()
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()
	const [provider] = useDocumentListen<Provider>(Provider, new Provider(role.id).documentReference)
	return (
		<MenuItem key={role.id} onClick={async () => {
			setProcessing(true)
			const adminAttach = firebase.functions().httpsCallable('v1-commerce-admin-attach')
			try {
				await adminAttach({ providerID: provider!.id })
				setMessage('success', 'Change admin')
				history.push(`/admin`)
			} catch (error) {
				setMessage('error', 'Error')
				console.error(error)
			}
			setProcessing(false)
		}}>{provider?.name || ''}</MenuItem>
	)
})
