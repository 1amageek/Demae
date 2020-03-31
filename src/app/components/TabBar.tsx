
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StorefrontIcon from '@material-ui/icons/Storefront';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import Link from 'next/link'

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
			<Link href='/home' prefetch>
				<BottomNavigationAction
					label="Home"
					value="home"
					icon={<StorefrontIcon />} />
			</Link>
			<Link href='/cart' prefetch>
				<BottomNavigationAction
					label="Cart"
					value="cart"
					icon={<StorefrontIcon />} />
			</Link>
			<Link href='/account' prefetch>
				<BottomNavigationAction
					label="Account"
					value="account"
					icon={<StorefrontIcon />} />
			</Link>
		</BottomNavigation>
	);
}
