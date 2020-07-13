import React, { useState } from "react"
import { Box, Typography } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"

type SegmentControlProps = {
	items: string[]
	selected: number
	setValue?: (index: number) => void
}

export const useSegmentControl = (items: string[]): [SegmentControlProps,] => {
	const [index, setIndex] = useState(0)
	return [{
		items,
		selected: index,
		setValue: setIndex
	}]
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		selected: {
			padding: "3px 5px",
			cursor: "pointer",
			background: "#FFF",
			boxShadow: "0 2px 2px rgba(0, 0, 0, 0.15)"
		},
		default: {
			padding: "3px 5px",
			cursor: "pointer",
			"&:hover": {
				backgroud: "rgba(0, 0, 0, 0.6)"
			}
		}
	})
);

export default (props: SegmentControlProps = { items: [], selected: 0 }) => {
	const classes = useStyles()
	return (
		<Box
			borderRadius={10}
			style={{
				padding: "3px",
				background: "rgba(0, 0, 0, 0.065)"
			}}>
			<Box display="flex">
				{props.items.map((item, index) => {
					return <Box
						className={index == props.selected ? classes.selected : classes.default}
						display="flex"
						key={index}
						borderRadius={8}
						padding={1}
						flexGrow={1}
						justifyContent="center"
						alignItems="center"
						onClick={(e) => {
							if (props.setValue) {
								props.setValue(index)
							}
						}}
					><Typography variant="button">{item}</Typography></Box>
				})}
			</Box>
		</Box>
	)
}
