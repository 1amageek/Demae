import React from "react"
import { Box, Typography, Button, Paper } from "@material-ui/core";

export default () => {
	return (
		<Box>
			{[...new Array(25).keys()].map(value => {
				return <Paper elevation={value} style={{
					width: "80px",
					height: "80px",
					margin: "40px auto"
				}}>{value}</Paper>
			})}
		</Box>
	)
}
