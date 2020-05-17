import React, { createContext, useContext, useState, useEffect, useRef, forwardRef } from 'react'
import { Slide, Box, Paper } from '@material-ui/core';

const NavigationChildContext = createContext<() => void>(() => { })
const NavigationChildProvider = ({ pop, children }: { pop: () => void, children: any }) => {
	return (
		<NavigationChildContext.Provider value={pop}>
			{children}
		</NavigationChildContext.Provider>
	)
}

export const usePop = () => {
	return useContext(NavigationChildContext)
}

const Child = ({ index, open, onClose, children }: { index: number, open: boolean, onClose: () => void, children: any }) => {
	const zIndex = 1000 + index
	return (
		<Slide direction="left" in={open} mountOnEnter unmountOnExit
			onExited={() => {
				onClose()
			}}
		>
			<Box
				zIndex={zIndex}
				position="absolute"
				display='flex'
				flexGrow={1}
				width='100%'
				top={0}
				bottom={0}
				left={0}
				right={0}
			>
				<Paper elevation={0} square style={{ width: '100%' }}>
					{children}
				</Paper>
			</Box>
		</Slide>
	)
}

interface Prop {
	component: React.ReactNode
}

const Base = ({ props, children }: { props: Prop[], children: any }) => {
	return (
		<Box
			position='relative'
			display='flex'
			flexGrow={1}
			width='100%'
			top={0}
			bottom={0}
			left={0}
			right={0}
		>
			{props.map((prop, index) => {
				return <Box key={index}>{prop.component}</Box>
			})}
			{children}
		</Box>
	)
}

export const NavigationContext = createContext<[(component: React.ReactNode) => void, number]>([() => { }, 0])
export const NavigationProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop[]>([])
	const onClose = () => {
		state.pop()
		setState([...state])
	}
	const setComponent = (component: React.ReactNode) => {
		const index = state.length
		const child = () => {
			const [open, setOpen] = useState(true)
			return (
				<NavigationChildProvider pop={() => {
					setOpen(false)
				}}>
					<Child index={index} open={open} onClose={onClose}>
						{component}
					</Child>
				</NavigationChildProvider>
			)
		}
		state.push({ component: child })
		setState([...state])
	}
	return (
		<NavigationContext.Provider value={[setComponent, state.length]}>
			<Base props={state}>
				{children}
			</Base>
		</NavigationContext.Provider>
	)
}

export const usePush = () => {
	return useContext(NavigationContext)
}

export default ({ children }: { children: any }) => {
	return (
		<NavigationProvider>
			{children}
		</NavigationProvider>
	)
}
