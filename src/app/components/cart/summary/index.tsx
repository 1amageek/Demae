import Paper from "@material-ui/core/Paper";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { Button, Box, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		button: {
			width: "100%",
			flexGrow: 1
		}
	}),
);

type SummaryType = "subtotal" | "tax" | "shipping" | "discount" | "total"

type SummaryItem = {
	type: SummaryType
	title: string
	detail: string
}

export default ({ items, disabled, onClick }: { items: SummaryItem[], disabled: boolean, onClick: (e) => void }) => {
	const classes = useStyles()
	return (
		<Paper elevation={0} variant="outlined">
			<Box paddingY={1} paddingX={2}>
				{items.map((item, index) => {
					return (
						<Box key={index} display="flex" justifyContent="space-between" paddingBottom={1}>
							<Typography variant="subtitle2">{item.title}</Typography>
							<Typography variant="body2">{item.detail}</Typography>
						</Box>
					)
				})}
			</Box>
			<Box padding={1}>
				<Button
					disabled={disabled}
					fullWidth
					variant="contained"
					size="large"
					color="primary"
					onClick={onClick}>
					Checkout
      		</Button>
			</Box>
		</Paper>
	)
}
