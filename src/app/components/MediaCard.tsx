import React from "react"
import { Box, Avatar, Typography } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { ImageProps } from "utils/ImageManager"

interface Props {
	imageProps: ImageProps
}

export default (props: Props) => {
	return (
		<Box style={{
			height: 0,
			width: "100%",
			paddingTop: "100%",
		}}>
			<Box position="relative">
				<Avatar variant="rounded" {...props.imageProps} style={{
					width: "100%",
					height: "100%",
					marginTop: "-100%"
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
		</Box>
	)
}
