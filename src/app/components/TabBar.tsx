
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StorefrontIcon from '@material-ui/icons/Storefront';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import MenuIcon from '@material-ui/icons/Menu';
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
			<Link href='/home'>
				<BottomNavigationAction
					label="Home"
					value="home"
					icon={<StorefrontIcon />} />
			</Link>
			<Link href='/cart'>
				<BottomNavigationAction
					label="Cart"
					value="cart"
					icon={<ShoppingCartIcon />} />
			</Link>
			<Link href='/account'>
				<BottomNavigationAction
					label="Account"
					value="account"
					icon={<MenuIcon />} />
			</Link>
		</BottomNavigation>
	);
}
