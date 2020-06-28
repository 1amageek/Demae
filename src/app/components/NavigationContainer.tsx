import React from "react"
import Box, { BoxProps } from '@material-ui/core/Box'

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
				{...props}
			>
				{props.children}
			</Box>
		</Box>
	)
}

export const ContentView = (props: BoxProps) => (
	<Box
		width="100%"
		height="100%"
		{...props}
	>
		{props.children}
	</Box>
)
