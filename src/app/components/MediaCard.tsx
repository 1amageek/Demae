import React from "react"
import { Box, Avatar } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { ImageProps } from "utils/ImageManager"
import { useWidth } from "hooks/geometry"

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

