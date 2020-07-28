import React, { useRef, useEffect, useState } from "react"
import { Box, Avatar, Typography } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { ImageProps } from "utils/ImageManager"

interface Props {
	imageProps: ImageProps
}

export default (props: Props) => {
	const [ref, length] = useWidth<HTMLDivElement>()
	const sizes = length ? `${length}px` : undefined
	return (
		<div ref={ref}>
			<Box position="relative" width={length}>
				<Avatar variant="rounded" {...props.imageProps} sizes={sizes} style={{
					width: "100%",
					height: "100%"
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
		</div>
	)
}

const useWidth = <T extends HTMLElement>(): [React.RefObject<T>, number] => {
	const ref = useRef<T>(null)
	const [width, setWidth] = useState(0)
	useEffect(() => {
		if (ref.current) {
			const { width } = ref.current.getBoundingClientRect()
			setWidth(width)
		}
	}, [ref])
	return [ref, width]
}
