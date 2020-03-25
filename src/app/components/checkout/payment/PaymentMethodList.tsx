import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import { useUser, useDataSource, useAuthUser } from 'hooks/commerce'
import { usePaymentMethods } from 'hooks/stripe'
import Loading from 'components/Loading'
import { PaymentMethod } from '@stripe/stripe-js';


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			// postion: 'fixed',
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

export default ({ paymentMethods }: { paymentMethods: PaymentMethod[] }) => {
	const classes = useStyles()
	return (
		<List className={classes.list} >
			{paymentMethods.map(paymentMethod => {
				return (
					<ListItem button key={paymentMethod.id} component={Link} to={`/checkout`}>
						<ListItemText primary={`${paymentMethod.card!.last4}`} />
					</ListItem>
				)
			})}
			<ListItem button component={Link} to='/checkout/paymentMethod'>
				<ListItemText primary={`Add Payment`} />
			</ListItem>
		</List>
	)
}
