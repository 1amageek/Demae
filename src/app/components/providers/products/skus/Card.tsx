import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SKU from 'models/commerce/SKU'
import { useCart } from 'hooks';
import Cart from 'models/commerce/Cart';
import User from 'models/commerce/User'

const useStyles = makeStyles({
	root: {
		// maxWidth: 345,
	},
});

export default ({ sku }: { sku: SKU }) => {
	const classes = useStyles();
	const [cart] = useCart()

	const addItem = async () => {
		if (!cart) { return }
		cart.addItem(sku)
		await cart.save()
	}

	return (
		<Card className={classes.root}>
			<CardActionArea>
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">
						Lizard
          </Typography>
					<Typography variant="body2" color="textSecondary" component="p">
						Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
						across all continents except Antarctica
          </Typography>
				</CardContent>
			</CardActionArea>
			<CardActions>
				<Button size="small" color="primary" onClick={addItem}>
					Add to Bag
        </Button>
			</CardActions>
		</Card>
	);
}
