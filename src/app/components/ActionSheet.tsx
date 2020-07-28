import React from "react"
import { Paper, Box, Typography, List, ListItemText, ListItem, Divider } from "@material-ui/core";
import { useDrawer } from "components/Drawer"

interface Props {
	title?: string
	detail?: string
	actions: Action[]
}

interface Action {
	title: string
	handler: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export default (props: Props) => {
	const [_, onClose] = useDrawer()
	return (
		<Paper>
			<Box>
				<Box padding={2}>
					{props.title && <Typography variant="subtitle1" gutterBottom>{props.title}</Typography>}
					{props.detail && <Typography variant="body1" color="textSecondary">{props.detail}</Typography>}
				</Box>
				{props.actions.map((prop, index) => {
					return (
						<List key={index}>
							<ListItem button onClick={prop.handler}>
								<ListItemText
									disableTypography
									primary={
										<Typography variant="button" style={{
											fontSize: "1.05rem"
										}}>{prop.title}</Typography>
									}
								/>
							</ListItem>
						</List>
					)
				})}
				<Divider />
				<List>
					<ListItem button onClick={onClose}>
						<ListItemText
							disableTypography
							primary={
								<Typography variant="button" style={{
									fontSize: "1.05rem"
								}}>Close</Typography>
							}
						/>
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
