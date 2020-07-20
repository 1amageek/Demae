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
import MediaCard from "components/MediaCard"

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
			</CardActions>
		</Card >
	);
}
