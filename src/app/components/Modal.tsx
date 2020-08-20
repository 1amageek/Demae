import React, { createContext, useContext, useState } from "react"
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

interface Prop {
	component?: React.ReactNode
	canCloseTapBackdrop: boolean
}

const _Modal = ({ open, component, onClose, canCloseTapBackdrop }: { open: boolean, component?: React.ReactNode, onClose: () => void, canCloseTapBackdrop: boolean }) => {
	if (open) {
		return (
			<Modal
				open={open}
				onClose={() => {
					if (canCloseTapBackdrop) onClose()
				}}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
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

export const ModalContext = createContext<[(component: React.ReactNode | undefined, canCloseTapBackdrop?: boolean) => void, () => void, boolean]>([() => { }, () => { }, false])
export const ModalProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop>({
		component: undefined,
		canCloseTapBackdrop: true
	})
	const open = !!state.component
	const closeModal = () => {
		setState({
			component: undefined,
			canCloseTapBackdrop: state.canCloseTapBackdrop
		})
	}
	const showModal = (component: React.ReactNode, canCloseTapBackdrop?: boolean) => {
		setState({
			component: component,
			canCloseTapBackdrop: canCloseTapBackdrop ?? true
		})
	}
	return (
		<ModalContext.Provider value={[showModal, closeModal, open]}>
			<_Modal open={open} component={state.component} onClose={closeModal} canCloseTapBackdrop={state.canCloseTapBackdrop} />
			{children}
		</ModalContext.Provider>
	)
}

export const useModal = () => {
	return useContext(ModalContext)
}
