import React from 'react';
import { Link } from 'react-router-dom'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import { Box, Card, CardActionArea, CardMedia, CardContent, CardActions, Avatar } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ImageIcon from '@material-ui/icons/Image';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Provider from 'models/commerce/Provider'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1
		},
		media: {
			minHeight: '280px',
			width: '100%'
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
		}
	})
)

export default ({ provider }: { provider: Provider }) => {
	const classes = useStyles();
	const [expanded, setExpanded] = React.useState(false);
	const coverImageURL = provider.coverImageURL()
	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	return (
		<Card className={classes.root}>
			<CardHeader
				avatar={
					<Avatar className={classes.avatar} src={provider.thumbnailImageURL()}>
						{provider.name.length > 0 ? provider.name[0].toUpperCase() : '-'}
					</Avatar>
				}
				action={
					<IconButton aria-label='settings'>
						<MoreVertIcon />
					</IconButton>
				}
				title={
					<Typography variant='h6' color='textSecondary' component='h1'>
						{provider.name}
					</Typography>
				}
				subheader={provider.caption}
			/>

			<CardActionArea>
				<Link to={`/providers/${provider.id}`}>
					<CardMedia
						className={classes.media}
						image={coverImageURL}
						title={provider.name}
					>
						<Avatar className={classes.media} variant="square" src={coverImageURL}>
							<ImageIcon />
						</Avatar>
					</CardMedia>
				</Link>

			</CardActionArea>
			{provider.description &&
				<CardContent>
					<Typography variant='body2' color='textSecondary' component='p'>
						{provider.description}
					</Typography>
				</CardContent>
			}
			<CardActions disableSpacing>
				<IconButton aria-label='add to favorites'>
					<FavoriteIcon />
				</IconButton>
				<IconButton aria-label='share'>
					<ShareIcon />
				</IconButton>
				{/* <IconButton
					className={clsx(classes.expand, {
						[classes.expandOpen]: expanded,
					})}
					onClick={handleExpandClick}
					aria-expanded={expanded}
					aria-label='show more'
				>
					<ExpandMoreIcon />
				</IconButton> */}
			</CardActions>
			{/* <Collapse in={expanded} timeout='auto' unmountOnExit>
				<CardContent>
					<Typography paragraph>Method:</Typography>
					<Typography paragraph>
						Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10
						minutes.
		      </Typography>
					<Typography paragraph>
						Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high
						heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly
						browned, 6 to 8 minutes. Transfer shrimp to a large plate and set aside, leaving chicken
						and chorizo in the pan. Add pimentón, bay leaves, garlic, tomatoes, onion, salt and
						pepper, and cook, stirring often until thickened and fragrant, about 10 minutes. Add
						saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
		      </Typography>
					<Typography paragraph>
						Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook
						without stirring, until most of the liquid is absorbed, 15 to 18 minutes. Reduce heat to
						medium-low, add reserved shrimp and mussels, tucking them down into the rice, and cook
						again without stirring, until mussels have opened and rice is just tender, 5 to 7
						minutes more. (Discard any mussels that don’t open.)
		      </Typography>
					<Typography>
						Set aside off of the heat to let rest for 10 minutes, and then serve.
		      </Typography>
				</CardContent>
			</Collapse> */}
		</Card >
	);
}
