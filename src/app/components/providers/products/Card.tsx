import React from "react";
import { Link } from "react-router-dom"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Card, CardActionArea, CardMedia, CardContent, Box, Avatar, Typography } from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import { useImage } from "utils/ImageManager"
import { useUser } from "hooks/commerce"
import { Product } from "models/commerce";
import ImageIcon from "@material-ui/icons/Image";
import { CurrencyCode } from "common/Currency"
import { useURL } from "hooks/url"
import MediaCard from "components/MediaCard"

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1
		},
		media: {
			// // height: "56%",
			// minHeight: "200px",
			// width: "100%",
			// borderRadius: "8px"
			paddingTop: "100%",
			height: 0,
			width: "100%"
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
	const currencies = Object.keys(prices) as CurrencyCode[]
	const userCurrency = user?.currency ?? "USD"
	const currency = currencies.includes(userCurrency) ? userCurrency : currencies[0]
	const amount = prices[currency] || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency }).format(amount)
	const imageURL = (product.imagePaths() || []).length > 0 ? product.imagePaths()[0] : undefined
	const imgProps = useImage({ path: imageURL, alt: `${product.name} ${product.caption ?? ""}` })

	return (
		<Card variant="outlined" style={{ border: "none", background: "none", borderRadius: "0px" }}>
			<Link to={url(`/providers/${providerID}/products/${product.id}`)}>
				<CardActionArea>
					<MediaCard imageProps={imgProps} />
					{/* <CardMedia
						className={classes.media}
						image={product.imageURLs()[0]}
						title={product.name}
					/> */}
				</CardActionArea>
			</Link >
			<CardContent style={{ padding: "12px" }}>
				<Typography variant="subtitle1">{product.name}</Typography>
				<Box color="text.secondary">{price}</Box>
			</CardContent>
		</Card >
	);
}
