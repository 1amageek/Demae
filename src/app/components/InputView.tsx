import React from "react"
import TextField, { useTextField } from "components/TextField"
import { Box, Paper, Typography, Button } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useModal } from "components/Modal"

interface Props {
	title?: string
	detail?: string
	buttonTitle?: string
	callback: (text: string) => void
}

export default (props: Props) => {
	const theme = useTheme()
	const [textField] = useTextField()
	const [_, closeModal] = useModal()

	const onSubmit = async (event) => {
		event.preventDefault();
		props.callback(textField.value as string || "")
	}

	return (
		<form onSubmit={onSubmit}>
			<Paper elevation={3}>
				<Box padding={2} minWidth={320}>
					<Box>
						{props.title && <Typography variant="subtitle1" gutterBottom>{props.title}</Typography>}
						{props.detail && <Typography variant="body1" color="textSecondary">{props.detail}</Typography>}
					</Box>
					<Box paddingY={1}>
						<TextField
							{...textField}
							fullWidth multiline
							size="small"
							variant="outlined"
							placeholder="comment"
							rows={4}
						/>
					</Box>
					<Box display="flex" justifyContent="flex-end">
						<Button
							type='submit'
							color='primary'
							onClick={closeModal}
							style={{
								marginRight: theme.spacing(1)
							}}>Cancel</Button>
						<Button type='submit' variant='contained' color='primary'>{props.buttonTitle ?? "Comment"}</Button>
					</Box>
				</Box>
			</Paper>
		</form>
	)
}
