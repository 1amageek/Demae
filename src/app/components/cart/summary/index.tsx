import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Box } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(1),
		},
		button: {
			width: '100%',
			flexGrow: 1
		}
	}),
);

type SummaryType = 'subtotal' | 'tax' | 'shipping' | 'discount' | 'total'

type SummaryItem = {
	type: SummaryType
	title: string
	detail: string
}

export default ({ items }: { items: SummaryItem[] }) => {
	const classes = useStyles()
	return (
		<>
			<Paper>
				<List dense>
					{items.map((item, index) => {
						return (
							<ListItem key={index}>
								<ListItemText primary={item.title} />
								<ListItemSecondaryAction>
									<ListItemText primary={item.detail} />
								</ListItemSecondaryAction>
							</ListItem>
						)
					})}
				</List>
				<Box className={classes.box}>
					<Button component={Link} to='/checkout' className={classes.button} variant="contained" size="large" color="primary">
						Checkout
      		</Button>
				</Box>
			</Paper>
		</>
	)
}
