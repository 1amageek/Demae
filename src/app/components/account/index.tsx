import React, { useContext, useEffect } from 'react';
import firebase from 'firebase';
import 'firebase/auth';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import { AppContext } from 'context'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			width: '100%',
			backgroundColor: theme.palette.background.paper,
		},
	}),
);

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
	return <ListItem button component="a" {...props} />;
}

export default () => {
	const classes = useStyles();
	return (
		<>
			<List component="nav" aria-label="main mailbox folders">
				<ListItem button>
					<ListItemIcon>
						<InboxIcon />
					</ListItemIcon>
					<ListItemText primary="Purchase history" />
				</ListItem>
				<ListItem button>
					<ListItemIcon>
						<DraftsIcon />
					</ListItemIcon>
					<ListItemText primary="Drafts" />
				</ListItem>
			</List>
			<Divider />
			<List component="nav" aria-label="secondary mailbox folders">
				<ListItem button>
					<ListItemText primary="Trash" />
				</ListItem>
				<ListItemLink href="#simple-list">
					<ListItemText primary="SignOut" onClick={async () => {
						await firebase.auth().signOut()
					}} />
				</ListItemLink>
			</List>
		</>
	);
}
