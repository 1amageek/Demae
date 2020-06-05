import React from 'react'
import { useLocation } from 'react-router-dom'
import { Tooltip, IconButton, Toolbar, Paper, Box } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useUser } from 'hooks/commerce'

import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import SendIcon from '@material-ui/icons/Send';

import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import TwitterIcon from '@material-ui/icons/Twitter';

import { useDrawer } from 'components/Drawer';
import { useSnackbar } from 'components/Snackbar';

export default () => {

	const [showDrawer, onClose] = useDrawer()
	const [user] = useUser()

	return (
		<Toolbar disableGutters>
			<Tooltip title='Like'>
				<div>
					<IconButton size='medium' onClick={() => { }}>
						<FavoriteBorderIcon color='inherit' />
					</IconButton>
				</div>
			</Tooltip>
			<Tooltip title='Share'>
				<div>
					<IconButton size='medium' onClick={async () => {
						let url = window.location.href
						if (user) {
							url = `${url}?mediatedby=${user.id}`
						}
						console.log('[ActionBar] clipped url: ', url)
						showDrawer(
							<ActionSheet text={url} url={url} onClose={onClose} />
						)
					}}>
						<SendIcon color='inherit' />
					</IconButton>
				</div>
			</Tooltip>
		</Toolbar>
	)
}

const ActionSheet = ({ url, text, onClose }: { url: string, text: string, onClose: () => void }) => {
	const [showSnackbar] = useSnackbar()
	return (
		<Paper>
			<Box>
				<Box fontSize={16} fontWeight={400} padding={2} color="text.secondary">
					Share this page.
				</Box>
				<List component="nav">
					<ListItem button onClick={async () => {
						await navigator.clipboard.writeText(url)
						showSnackbar('success', 'Copied this page URL.')
						onClose()
					}}>
						<ListItemIcon>
							<AssignmentTurnedInIcon />
						</ListItemIcon>
						<ListItemText primary="Copy URL of this page" />
					</ListItem>
					<ListItem button onClick={() => {
						const encoded = encodeURI(url)
						const uri = `https://twitter.com/intent/tweet?text=${encoded}`
						window.open(uri, '_blank')
						onClose()
					}}>
						<ListItemIcon>
							<TwitterIcon />
						</ListItemIcon>
						<ListItemText primary="Twitter" />
					</ListItem>
				</List>
				<Divider />
				<List component="nav">
					<ListItem button onClick={onClose}>
						<ListItemText primary="Cancel" />
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
