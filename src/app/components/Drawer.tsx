import React, { createContext, useContext, useState } from 'react'
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer } from '@material-ui/core';

const useStyles = makeStyles({
	list: {
		width: 250,
	},
	fullList: {
		width: 'auto',
	},
});

type Anchor = 'top' | 'left' | 'bottom' | 'right';

const _Drawer = ({ open, anchor, onClose, children }: { open: boolean, anchor: Anchor, onClose: () => void, children: any }) => {
	const classes = useStyles();

	const [state, setState] = React.useState({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	const toggleDrawer = (anchor: Anchor, open: boolean) => (
		event: React.KeyboardEvent | React.MouseEvent,
	) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' ||
				(event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}

		setState({ ...state, [anchor]: open });
	};

	const Content = (anchor: Anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === 'top' || anchor === 'bottom',
			})}
			role="presentation"
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			{children}
		</div>
	);

	return (
		<div>
			<Drawer anchor={anchor} open={open} onClose={onClose}>
				{Content(anchor)}
			</Drawer>
		</div>
	);
}

interface Prop {
	anchor: Anchor
	component?: React.ReactNode
}
export const DrawerContext = createContext<[(component: React.ReactNode | undefined, anchor?: Anchor) => void, () => void, boolean]>([() => { }, () => { }, false])
export const DrawerProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop>({
		anchor: 'bottom',
		component: undefined
	})
	const open = !!state.component
	const onClose = () => {
		setState({ component: undefined, anchor: 'bottom' })
	}
	const showDrawer = (component: React.ReactNode, anchor: Anchor = 'bottom') => {
		setState({ component, anchor })
	}
	return (
		<DrawerContext.Provider value={[showDrawer, onClose, open]}>
			<_Drawer open={open} anchor={state.anchor} onClose={onClose}>{state.component}</_Drawer>
			{children}
		</DrawerContext.Provider>
	)
}

export const useDrawer = () => {
	return useContext(DrawerContext)
}
