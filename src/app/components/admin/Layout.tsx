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
import ImageIcon from '@material-ui/icons/Image';
import MenuIcon from '@material-ui/icons/Menu';
import NearMeIcon from '@material-ui/icons/NearMe';
import PlaceIcon from '@material-ui/icons/Place';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { Drawer, AppBar, Toolbar, List, ListItem, ListItemText, Avatar, Divider, Box, MenuItem, Menu, IconButton, Collapse } from '@material-ui/core';
import Provider, { Role } from 'models/commerce/Provider'
import { useRoles, useUser, useAdminProvider } from 'hooks/commerce'
import { useDocumentListen } from 'hooks/firestore'
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import { ListItemIcon } from '@material-ui/core';
import Label from 'components/Label';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		list: {
			width: 250,
		},
		fullList: {
			width: 'auto',
		},
		nested: {
			paddingLeft: theme.spacing(4),
		},
	}),
);

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default ({ children }: { children: any }) => {
	const classes = useStyles()
	const [provider] = useAdminProvider()

	const previewLink = provider ? `/providers/${provider.id}` : '/providers'
	const [state, setState] = React.useState({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	const [open, setOpen] = useState(false);

	const toggleDrawer = (anchor: Anchor, open: boolean) => (
		event: React.KeyboardEvent | React.MouseEvent,
	) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' ||
				(event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}

		setState({ ...state, [anchor]: open });
	};

	const list = (anchor: Anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === 'top' || anchor === 'bottom',
			})}
			role="presentation"
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<Box display='flex'
				flexDirection='column'
				flexGrow={1}
				justifyContent='center'
				alignItems='center'
				fontSize={18}
				fontWeight={600}
				paddingY={3}>
				<Avatar variant='circle' src={provider?.thumbnailImageURL()} style={{ width: '80px', height: '80px' }}>
					<ImageIcon />
				</Avatar>
				{provider && provider.name}
			</Box>

			<Box display='flex'
				flexDirection='column'
				flexGrow={1}
				justifyContent='center'
				alignItems='center'
				paddingY={1}>
				<Label color={provider?.isAvailable ? 'green' : 'red'}>{provider?.isAvailable ? 'ON SALE' : 'NOW CLOSED'}</Label>
			</Box>

			<List>
				<ListItem button key={'product'} component={Link} to='/admin/products'>
					<ListItemIcon>
						<CheckBoxOutlineBlankIcon />
					</ListItemIcon>
					<ListItemText primary={'Catalog'} />
				</ListItem>
				<ListItem button key={'orders'} onClick={(e) => {
					e.stopPropagation()
					setOpen(!open)
				}}>
					<ListItemIcon>
						<ViewListIcon />
					</ListItemIcon>
					<ListItemText primary={'Orders'} />
					{open ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open} timeout="auto" unmountOnExit>
					<List>
						<ListItem className={classes.nested} button key={'pickup'} component={Link} to='/admin/orders?deliveryMethod=pickup'>
							<ListItemIcon>
								<PlaceIcon />
							</ListItemIcon>
							<ListItemText primary={'Pickup'} />
						</ListItem>
						<ListItem className={classes.nested} button key={'shipping'} component={Link} to='/admin/orders?deliveryMethod=shipping'>
							<ListItemIcon>
								<LocalShippingIcon />
							</ListItemIcon>
							<ListItemText primary={'Shipping'} />
						</ListItem>
						<ListItem className={classes.nested} button key={'download'} component={Link} to='/admin/orders?deliveryMethod=none'>
							<ListItemIcon>
								<CloudDownloadIcon />
							</ListItemIcon>
							<ListItemText primary={'Download'} />
						</ListItem>
					</List>
				</Collapse>
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
					window.open(previewLink, '_blank')
				}}>
					<ListItemIcon>
						<PublicIcon />
					</ListItemIcon>
					<ListItemText primary={'Preview'} />
				</ListItem>
			</List>
		</div>
	);

	return (
		<>
			<Drawer anchor='left' open={state['left']} onClose={toggleDrawer('left', false)}>
				{list('left')}
			</Drawer>
			<Box display='flex' style={{ minHeight: '100vh' }} >
				<AppBar
					color='inherit'
					position='fixed'
					elevation={0}
				>
					<Toolbar>
						<IconButton
							color='inherit'
							aria-label='open drawer'
							onClick={toggleDrawer('left', true)}
							edge='start'
						>
							<MenuIcon />
						</IconButton>
						<Box fontSize={18} fontWeight={600}>
							{provider && provider.name}
						</Box>
						<div style={{ flexGrow: 1 }}></div>
						<AccountMenu />
					</Toolbar>
				</AppBar>
				<Box display='flex' style={{ minHeight: '100vh', width: '100%', paddingTop: '65px' }} >
					{children}
				</Box>
			</Box>
		</>
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
			const adminAttach = firebase.functions().httpsCallable('commerce-v1-admin-attach')
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
