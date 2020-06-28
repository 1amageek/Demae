import React from 'react'

import Box, { BoxProps } from '@material-ui/core/Box'

interface Prop extends BoxProps {
	color: any
	children?: any
}

export default (prop: Prop) => {
	const { fontSize } = prop
	const fontWeight = prop.fontWeight || 700
	const padding = (fontSize || 14) < 14 ? '2px 6px' : '3px 8px'
	const marginRight = 1
	return (
		<Box display='inline-flex'
			flexShrink={1}
			border={1}
			borderRadius={10}
			borderColor={prop.color}
			marginRight={marginRight}
			fontWeight={fontWeight}
			{...prop}
			style={{
				padding
			}}
		>{prop.children}</Box>
	)
}
