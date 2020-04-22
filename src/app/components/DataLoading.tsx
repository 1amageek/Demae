import React from 'react'
import { Box, CircularProgress } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			flexGrow: 1,
			padding: theme.spacing(4),
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	})
)
export default () => {
	const classes = useStyles()
	return (
		<Box className={classes.box}>
			<CircularProgress />
		</Box>
	)
}
