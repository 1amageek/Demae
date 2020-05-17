import React, { createContext, useContext, useState } from 'react'
import { Snackbar, IconButton, Box } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';

const ErrorColor = "#dd0000"
const WarningColor = "#ffb300"
const InfoColor = "#1a4fff"
const SuccessColor = "#3ace55"

const Bar = ({ open, severity, vertical, message, onClose }: { open: boolean, severity: Severity, vertical?: 'top' | 'bottom', message?: string, onClose: (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => void }) => {
	if (open) {
		return (
			<Snackbar
				anchorOrigin={{
					vertical: vertical || 'top',
					horizontal: 'center',
				}}
				open={open}
				autoHideDuration={2800}
				onClose={onClose}
				message={
					<Box display='flex' alignItems='center' fontSize={14} fontWeight={400}>
						{severity === 'error' && <ErrorIcon fontSize="small" style={{ marginRight: '8px', color: ErrorColor }} />}
						{severity === 'warning' && <WarningIcon fontSize="small" style={{ marginRight: '8px', color: WarningColor }} />}
						{severity === 'info' && <InfoIcon fontSize="small" style={{ marginRight: '8px', color: InfoColor }} />}
						{severity === 'success' && <CheckCircleIcon fontSize="small" style={{ marginRight: '8px', color: SuccessColor }} />}
						{message}
					</Box>
				}
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
	vertical?: 'top' | 'bottom'
}
export type Severity = 'error' | 'warning' | 'info' | 'success'
export const SnackbarContext = createContext<[(severity: Severity, message?: string, vertical?: 'top' | 'bottom') => void, boolean]>([() => { }, false])
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
			<Bar open={open} severity={state.severity} vertical={state.vertical} message={state.message} onClose={onClose} />
			{children}
		</SnackbarContext.Provider>
	)
}

export const useSnackbar = () => {
	return useContext(SnackbarContext)
}
