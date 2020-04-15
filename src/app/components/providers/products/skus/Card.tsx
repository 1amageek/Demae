import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { Button, Tooltip, IconButton } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Typography from '@material-ui/core/Typography';
import SKU from 'models/commerce/SKU'
import { useCart } from 'hooks/commerce';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1
		},
		media: {
			height: 0,
			paddingTop: '56.25%', // 16:9
		},
		expand: {
			transform: 'rotate(0deg)',
			marginLeft: 'auto',
			transition: theme.transitions.create('transform', {
				duration: theme.transitions.duration.shortest,
			}),
		},
		expandOpen: {
			transform: 'rotate(180deg)',
		}
	}),
);

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
			<CardContent>
				<Typography variant="h5">
					{sku.name}
				</Typography>
			</CardContent>
			{(sku.imageURLs().length > 0) &&
				<CardMedia
					className={classes.media}
					image={sku.imageURLs()[0]}
					title={sku.name}
				/>
			}
			{
				sku.caption &&
				<CardContent>
					<Typography variant="body2" color="textSecondary" component="p">
						{sku.caption}
					</Typography>
				</CardContent>
			}
			<CardActions>
				<Button size="small" color="primary" onClick={addItem}>
					Add to Bag
        </Button>

				<Tooltip title='Back'>
					<IconButton>
						<RemoveCircleIcon color='inherit' />
					</IconButton>
				</Tooltip>

				<Tooltip title='Back'>
					<IconButton>
						<AddCircleIcon color='inherit' />
					</IconButton>
				</Tooltip>
			</CardActions>
		</Card>
	);
}
