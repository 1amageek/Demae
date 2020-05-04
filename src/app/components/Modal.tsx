import React, { createContext, useContext, useState } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

interface Prop {
	component?: React.ReactNode
}

const _Modal = ({ open, component, onClose }: { open: boolean, component?: React.ReactNode, onClose: () => void }) => {
	if (open) {
		return (
			<Modal
				open={open}
				onClose={onClose}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={open}>
					<>
						{component}
					</>
				</Fade>
			</Modal>
		)
	}
	return <></>
}

export const ModalContext = createContext<[(component: React.ReactNode | undefined) => void, boolean]>([() => { }, false])
export const ModalProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop>({
		component: undefined
	})
	const open = !!state.component
	const onClose = () => {
		setState({
			component: undefined
		})
	}
	const setModal = (component: React.ReactNode) => {
		setState({ component })
	}
	return (
		<ModalContext.Provider value={[setModal, open]}>
			<_Modal open={open} component={state.component} onClose={onClose} />
			{children}
		</ModalContext.Provider>
	)
}

export const useDialog = () => {
	return useContext(ModalContext)
}
