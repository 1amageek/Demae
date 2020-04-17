import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Card, CardActionArea, CardMedia, CardContent, CardActions, Avatar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import { UserContext } from 'hooks/commerce'
import { useDataSourceListen } from 'hooks/commerce';
import { Provider, Product } from 'models/commerce';
import ImageIcon from '@material-ui/icons/Image';
import ISO4217 from 'common/ISO4217'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1
		},
		media: {
			// height: '56%',
			minHeight: '200px',
			width: '100%'
			// paddingTop: '56.25%', // 16:9
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
		},
		avatar: {
			backgroundColor: red[500],
		},

	}),
);

export default ({ providerID, product }: { providerID: string, product: Product }) => {
	const classes = useStyles();
	const [expanded, setExpanded] = useState(false);

	const [user] = useContext(UserContext)

	const price = product.price || {}
	const currency = user?.currency || 'USD'
	const symbol = ISO4217[currency].symbol
	const amount = price[currency]
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	return (
		<Card className={classes.root}>
			<Link to={`/providers/${providerID}/products/${product.id}`}>
				<CardActionArea>
					<CardMedia
						className={classes.media}
						image={imageURL}
						title={product.name}
					>
						<Avatar className={classes.media} variant="square" src={imageURL}>
							<ImageIcon />
						</Avatar>
					</CardMedia>
				</CardActionArea>
			</Link >
			<CardContent>
				<Typography variant="h6">{product.name}</Typography>
				<Typography>{amount && symbol}{amount && amount.toLocaleString()}</Typography>
				<Typography variant="body2" color="textSecondary" component="p">{product.caption}</Typography>
			</CardContent>
			<CardActions disableSpacing>
				<IconButton aria-label="add to favorites">
					<FavoriteIcon />
				</IconButton>
				<IconButton aria-label="share">
					<ShareIcon />
				</IconButton>
				{/* <IconButton
					className={clsx(classes.expand, {
						[classes.expandOpen]: expanded,
					})}
					onClick={handleExpandClick}
					aria-expanded={expanded}
					aria-label="show more"
				>
					<ExpandMoreIcon />
				</IconButton> */}
			</CardActions>
			{/* <Collapse in={expanded} timeout="auto" unmountOnExit>
				<CardContent>
					<Typography paragraph>Method:</Typography>
					<Typography paragraph>
						Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high
						heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly
						browned, 6 to 8 minutes. Transfer shrimp to a large plate and set aside, leaving chicken
						and chorizo in the pan. Add pimentón, bay leaves, garlic, tomatoes, onion, salt and
						pepper, and cook, stirring often until thickened and fragrant, about 10 minutes. Add
						saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
		      </Typography>
					<Typography>
						Set aside off of the heat to let rest for 10 minutes, and then serve.
		      </Typography>
				</CardContent>
			</Collapse> */}
		</Card >
	);
}
