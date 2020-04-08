import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Router from 'next/router'
import clsx from 'clsx';
import firebase from 'firebase'
import '@firebase/auth'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useAdmin, useDataSource, useAuthUser } from 'hooks/commerce';
import Loading from 'components/Loading';
import { Role } from 'models/commerce/User';
import Provider from 'models/commerce/Provider'
import { User, Product } from 'models/commerce';
import DataSource from 'lib/DataSource';

const drawerWidth = 180;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
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
			padding: theme.spacing(2, 0),
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
	}),
);

export default ({ children }: { children: any }) => {
	const classes = useStyles()
	const [admin, isLoading] = useAdmin()
	const [auth] = useAuthUser()
	const theme = useTheme()
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!isLoading && !admin) {
			Router.push('/')
		}
	}, [isLoading])


	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	if (isLoading || !admin) {
		return <Loading />
	}

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar
				position='fixed'
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
						Admin
          </Typography>
					<div style={{ flexGrow: 1 }}></div>
					<AccountMenu uid={auth?.uid} />
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
					<Link href='/admin/products'>
						<ListItem button key={'product'}>
							<ListItemText primary={'Product'} />
						</ListItem>
					</Link>
					<Link href='/admin/orders'>
						<ListItem button key={'orders'}>
							<ListItemText primary={'Orders'} />
						</ListItem>
					</Link>
					<Link href='/admin/account'>
						<ListItem button key={'account'}>
							<ListItemText primary={'Account'} />
						</ListItem>
					</Link>
				</List>
			</Drawer>
			<main
				className={clsx(classes.content, {
					[classes.contentShift]: open,
				})}
			>
				<div className={classes.drawerHeader} />

				<Container>
					{children}
				</Container>
			</main>
		</div>
	);
}

const AccountMenu = ({ uid }: { uid?: string }) => {
	if (uid) {
		const datasource = DataSource.ref(new User(uid).roles.collectionReference).get(Role).map(doc => {
			return Provider.get<Provider>(doc.id)
		})
		const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
		const menuOpen = Boolean(anchorEl)
		const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorEl(event.currentTarget);
		}
		const handleClose = () => {
			setAnchorEl(null);
		}

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
					{datasource.data.map(p => {
						return (
							<MenuItem key={p.id} onClick={() => {
								Router.push('/admin')
							}}>{p.name}</MenuItem>
						)
					})}
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
