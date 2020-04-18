import React from 'react'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@material-ui/core';
import { useDialog, DialogProps } from 'components/Dialog';

interface ErrorDialogProps extends DialogProps {
	title?: string
	detail?: string
}

const ErrorDialog = (props: ErrorDialogProps) => (
	<Dialog
		open={props.open}
		onClose={props.onClose}
	>
		<DialogTitle>{props.title}</DialogTitle>
		<DialogContent>
			<DialogContentText>{props.detail}</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={props.onNext} color='primary' autoFocus>
				OK
      </Button>
		</DialogActions>
	</Dialog>
)

export const useErrorDialog = (title?: string, detail?: string) => {
	const dialog = (props: DialogProps) => {
		return <ErrorDialog title={title} detail={detail} {...props} />
	}
	return useDialog(dialog)
}
