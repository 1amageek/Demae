import React, { createContext, useContext, useState, useEffect, useRef, forwardRef } from "react"
import Box, { BoxProps } from "@material-ui/core/Box"
import { useHistory } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { Paper, Toolbar } from "@material-ui/core"
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';

interface Props {
	title: string
	href: string
}

export const NavigationView = (props: BoxProps) => (
	<Box
		width="100vw"
		height="100vh"
	>
		<Box
			display="flex"
			height="100vh"
			{...props}
		>
			{props.children}
		</Box>
	</Box>
)

// List View

export const ListViewContext = createContext<React.Dispatch<React.SetStateAction<Props | undefined>>>(() => { })
export const ListViewProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Props>()
	const history = useHistory()
	if (state) {
		return (
			<ListViewContext.Provider value={setState}>
				<Toolbar variant="dense" disableGutters>
					<Box paddingX={1}>
						<Button variant="text" size="small" color="primary"
							startIcon={<ArrowBackIosOutlinedIcon />}
							onClick={() => {
								history.push(state.href)
							}}>{state.title}</Button>
					</Box>
				</Toolbar>
				{children}
			</ListViewContext.Provider>
		)
	}

	return (
		<ListViewContext.Provider value={setState}>
			<Toolbar variant="dense" disableGutters></Toolbar>
			{children}
		</ListViewContext.Provider>
	)
}

export const useListToolbar = (props: Props) => {
	const setState = useContext(ListViewContext)
	useEffect(() => {
		setState(props)
	}, [JSON.stringify(props)])
}

export const ListView = (props: BoxProps) => {
	const maxWidth = props.maxWidth || "380px"
	return (
		<Box
			width="100%"
			maxWidth={maxWidth}
			height="100%"
		>
			<Box
				position="fixed"
				width="inherit"
				maxWidth="inherit"
				style={{
					paddingTop: "48px"
				}}
				{...props}
			>
				<ListViewProvider>
					{props.children}
				</ListViewProvider>
			</Box>
		</Box>
	)
}

interface EditProps {
	hander: (event: React.FormEvent<HTMLFormElement>) => void
}

export const EditContext = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>, React.Dispatch<React.SetStateAction<EditProps | undefined>>]>([false, () => { }, () => { }])
export const EditProvider = ({ children }: { children: any }) => {
	const [isEditing, setEditing] = useState(false)
	const [onSubmit, setSubmit] = useState<EditProps>()

	if (isEditing) {
		return (
			<EditContext.Provider value={[isEditing, setEditing, setSubmit]}>
				<form onSubmit={(e) => {
					if (onSubmit) onSubmit.hander(e)
				}}>{children}</form>
			</EditContext.Provider >
		)
	}

	return (
		<EditContext.Provider value={[isEditing, setEditing, setSubmit]}>
			{children}
		</EditContext.Provider >
	)
}

export const useEdit = (onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void): [boolean, React.Dispatch<React.SetStateAction<boolean>>, React.Dispatch<React.SetStateAction<EditProps | undefined>>] => {
	const [isEditing, setEditing, setSubmit] = useContext(EditContext)
	useEffect(() => {
		if (onSubmit) {
			setSubmit({
				hander: onSubmit
			})
		}
	}, [])
	return [isEditing, setEditing, setSubmit]
}

// ContentView View

export const ContentViewContext = createContext<React.Dispatch<React.SetStateAction<React.ReactNode>>>(() => { })
export const ContentViewProvider = ({ children }: { children: any }) => {
	const [component, setComponent] = useState<React.ReactNode>()

	if (component) {
		return (
			<ContentViewContext.Provider value={setComponent}>
				<Toolbar variant="dense" disableGutters>
					{component}
				</Toolbar>
				{children}
			</ContentViewContext.Provider>
		)
	}

	return (
		<ContentViewContext.Provider value={setComponent}>
			<Toolbar variant="dense" disableGutters>{component}</Toolbar>
			{children}
		</ContentViewContext.Provider>
	)
}

export const useContentToolbar = (props: React.ReactNode, deps?: React.DependencyList) => {
	const setComponent = useContext(ContentViewContext)
	useEffect(() => {
		setComponent(props)
	}, deps)
}

export const ContentView = (props: BoxProps) => (
	<Box
		width="100%"
		height="100%"
		{...props}
	>
		<Paper
			elevation={0}
			style={{
				paddingTop: "48px",
				height: "100%"
			}}>
			<EditProvider>
				<ContentViewProvider>
					<Box>
						{props.children}
					</Box>
				</ContentViewProvider>
			</EditProvider>
		</Paper>
	</Box>
)
