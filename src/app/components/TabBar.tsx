
import React, { useState } from 'react';
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StorefrontIcon from '@material-ui/icons/Storefront';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles({
	root: {
		position: 'fixed',
		width: '100%',
		flexGrow: 1,
		bottom: 0
	},
});

export default () => {
	const classes = useStyles();
	const router = useRouter()
	const route = router.route || 'home'
	const [value, setValue] = useState(route)
	const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
		setValue(newValue);
	}
	return (
		<BottomNavigation value={value} onChange={handleChange} className={classes.root}>
			<BottomNavigationAction
				href='/home'
				label='Home'
				value='home'
				icon={<StorefrontIcon />} />
			<BottomNavigationAction
				href='/cart'
				label='Cart'
				value='cart'
				icon={<ShoppingCartIcon />} />
			<BottomNavigationAction
				href='/account'
				label='Account'
				value='account'
				icon={<MenuIcon />} />
		</BottomNavigation>
	);
}
