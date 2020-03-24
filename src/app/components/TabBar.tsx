
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

export default function LabelBottomNavigation() {
	const classes = useStyles();
	const [value, setValue] = React.useState('recents');

	const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
		setValue(newValue);
	};

	return (
		<BottomNavigation value={value} onChange={handleChange} className={classes.root}>

			<BottomNavigationAction
				component={Link}
				to='/home'
				label="Home"
				value="recents"
				icon={<StorefrontIcon />} />
			<BottomNavigationAction
				component={Link}
				to='/cart'
				label="Cart"
				value="nearby"
				icon={<ShoppingCartIcon />} />
			<BottomNavigationAction label="Account" value="folder" icon={<PersonPinIcon />} />
		</BottomNavigation>
	);
}
