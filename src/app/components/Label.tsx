import React from 'react'

import { Box } from '@material-ui/core'

interface Prop {
	color: any
	children?: any
}

export default (prop: Prop) => {
	return (
		<Box display='inline-flex'
			flexShrink={1}
			border={1}
			borderRadius={8}
			borderColor={prop.color}
			{...prop}
			style={{
				padding: '3px 8px'
			}}
		>{prop.children}</Box>
	)
}
