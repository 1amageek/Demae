import React from 'react'
import { Tooltip, IconButton, Toolbar, Paper, Box } from '@material-ui/core';
import { useUser } from 'hooks/commerce'

import { Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';

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
				<Box padding={2}>
					<Typography variant="subtitle1">Share this page</Typography>
				</Box>
				<List>
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
						window.open(uri, '_blank', "height=1000,width=1200")
						onClose()
					}}>
						<ListItemIcon>
							<TwitterIcon />
						</ListItemIcon>
						<ListItemText primary="Twitter" />
					</ListItem>
				</List>
				<Divider />
				<List>
					<ListItem button onClick={onClose}>
						<ListItemText primary="Cancel" />
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
