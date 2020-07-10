
import React from "react"
import { Box, Paper } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import { useTheme } from "@material-ui/core/styles";

export default ({ data, imageWidth, imageHeight }: { data: string[], imageWidth?: string, imageHeight?: string }) => {
	const theme = useTheme()
	return (
		<Box
			display="flex"
			flexWrap="wrap"
			justifyContent="space-around"
			overflow="hidden"
		>
			<Box
				display="flex"
				overflow="hidden"
				width="100%"
				style={{
					overflow: "scroll",
					overscrollBehavior: "auto"
				}}
			>
				<Box display="flex" paddingY={2}>
					{data.map((url, index) => {
						return (
							<Paper elevation={1} key={index} style={{
								marginLeft: theme.spacing(0.5),
								marginRight: theme.spacing(0.5)
							}}>
								<Avatar variant="square" src={url} style={{
									height: imageHeight ?? "220px",
									width: imageWidth ?? "220px"
								}}>
									<ImageIcon />
								</Avatar>
							</Paper>
						)
					})}
				</Box>
			</Box>
		</Box>
	)
}

