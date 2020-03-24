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
import User from 'models/commerce/User'
import Address from 'models/commerce/Address';
import Loading from 'components/Loading'
import PaymentMethodList from './payment/PaymentMethodList'

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


export default () => {
	const classes = useStyles()
	const [auth] = useAuthUser()
	const [addresses, isAddressLoading] = useDataSource<Address>(new User(auth?.uid).addresses.collectionReference.limit(10), Address)
	return (
		<>
			<Paper className={classes.paper}>
				{isAddressLoading ? (
					<Loading />
				) : (
						<List className={classes.list} >
							{addresses.map(address => {
								return (
									<ListItem button key={address.id} component={Link} to={`/checkout/shipping/${address.id}`}>
										<ListItemText primary={`${address.formatted()}`} />
									</ListItem>
								)
							})}
							<ListItem button component={Link} to='/checkout/shipping'>
								<ListItemText primary={`Add Shpping Address`} />
							</ListItem>
						</List>
					)}
			</Paper>

			<Paper className={classes.paper}>
				<PaymentMethodList />
			</Paper>

			<Button className={classes.button} variant="contained" color="primary">
				Continu to Payment
      </Button>
		</>

	)
}
