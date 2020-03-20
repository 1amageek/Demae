import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			position: 'absolute',
			width: 400,
			top: '50%',
			left: '50%',
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
	}),
);

export default ({ open, onClose, children }: { open: boolean, onClose: () => void, children: any }) => {
	const classes = useStyles();
	return (
		<Modal
			aria-labelledby="simple-modal-title"
			aria-describedby="simple-modal-description"
			open={open}
			onClose={onClose}
		>
			<div className={classes.paper}>
				{children}
			</div>
		</Modal>
	);
}
