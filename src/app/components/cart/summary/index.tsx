import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			postion: 'fixed',
			bottom: 50,
			width: '100%',
			flexGrow: 1,
			padding: theme.spacing(1),
		},
		list: {
			marginBottom: theme.spacing(2),
		},
		button: {
			width: '100%',
			flexGrow: 1,
		}
	}),
);

type SummaryType = 'price' | 'tax' | 'shipping' | 'discount'

type SummaryItem = {
	type: SummaryType
	title: string
	detail: string
}

export default ({ items }: { items: SummaryItem[] }) => {
	const classes = useStyles()
	return (
		<Paper className={classes.paper}>
			<List className={classes.list} >
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
			<Button component={Link} to='/checkout' className={classes.button} variant="contained" color="primary">
				Checkout
      </Button>
		</Paper>
	)
}
