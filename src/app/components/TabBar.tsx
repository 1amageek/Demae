
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StorefrontIcon from '@material-ui/icons/Storefront';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { Link } from 'react-router-dom'

const useStyles = makeStyles({
	root: {
		position: "fixed",
		width: '100%',
		flexGrow: 1,
		bottom: 0
	},
});

export default () => {
	const classes = useStyles();
	const [value, setValue] = React.useState('home');

	const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
		setValue(newValue);
	}

	return (
		<BottomNavigation value={value} onChange={handleChange} className={classes.root}>
			<BottomNavigationAction
				component={Link}
				to='/home'
				label="Home"
				value="home"
				icon={<StorefrontIcon />} />
			<BottomNavigationAction
				component={Link}
				to='/cart'
				label="Cart"
				value="cart"
				icon={<ShoppingCartIcon />} />
			<BottomNavigationAction
				component={Link}
				to='/account'
				label="Account"
				value="account"
				icon={<PersonPinIcon />} />
		</BottomNavigation>
	);
}
