import React, { createContext, useContext, useState } from 'react'
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const Bar = ({ open, message, onClose }: { open: boolean, message?: string, onClose: (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => void }) => {
	if (open) {
		return (
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				open={open}
				autoHideDuration={2500}
				onClose={onClose}
				message={message}
				action={
					<React.Fragment>
						<IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</React.Fragment>
				}
			/>
		)
	}
	return <></>
}

interface Prop {
	message?: string
	severity: Severity
}
export type Severity = 'error' | 'warning' | 'info' | 'success'
export const SnackbarContext = createContext<[(severity: Severity, message?: string) => void, boolean]>([() => { }, false])
export const SnackbarProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop>({
		message: undefined,
		severity: 'success'
	})
	const open = !!state.message
	const onClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setState({
			message: undefined,
			severity: 'success'
		})
	}
	const setMessageWithSeverity = (severity: Severity, message?: string) => {
		setState({ message, severity })
	}
	return (
		<SnackbarContext.Provider value={[setMessageWithSeverity, open]}>
			<Bar open={open} message={state.message} onClose={onClose} />
			{children}
		</SnackbarContext.Provider>
	)
}

export const useSnackbar = () => {
	return useContext(SnackbarContext)
}
