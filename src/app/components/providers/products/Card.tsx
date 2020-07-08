import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Card, CardActionArea, CardMedia, CardContent, CardActions, Box, Avatar } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import { useUser } from "hooks/commerce"
import { Product } from "models/commerce";
import ImageIcon from "@material-ui/icons/Image";
import { Symbol } from "common/Currency"
import { useURL } from "hooks/url"

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1
		},
		media: {
			// height: "56%",
			minHeight: "200px",
			width: "100%",
			borderRadius: "8px"
		},
		expand: {
			transform: "rotate(0deg)",
			marginLeft: "auto",
			transition: theme.transitions.create("transform", {
				duration: theme.transitions.duration.shortest,
			}),
		},
		expandOpen: {
			transform: "rotate(180deg)",
		},
		avatar: {
			backgroundColor: red[500],
		},

	}),
);

export default ({ providerID, product }: { providerID: string, product: Product }) => {
	const classes = useStyles();
	const [user] = useUser()
	const url = useURL();

	const prices = product.price
	const currency = user?.currency || "USD"
	const symbol = Symbol(currency)
	const amount = prices[currency] || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency }).format(amount)
	const imageURL = product.imageURLs().length > 0 ? product.imageURLs()[0] : undefined

	return (
		<Card variant="outlined" style={{ border: "none", background: "none", borderRadius: "0px" }}>
			<Link to={url(`/providers/${providerID}/products/${product.id}`)}>
				<CardActionArea>
					<CardMedia
						className={classes.media}
						image={imageURL}
						title={product.name}
					>
						<Avatar className={classes.media} variant="rounded" src={imageURL}>
							<ImageIcon />
						</Avatar>
					</CardMedia>
				</CardActionArea>
			</Link >
			<CardContent style={{ padding: "12px" }}>
				<Box fontSize={18} fontWeight={800}>
					{product.name}
				</Box>
				<Box color="text.secondary" >
					{price}
				</Box>
			</CardContent>
		</Card >
	);
}
