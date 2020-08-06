
import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Grid, Divider, Box, Hidden } from "@material-ui/core";
import ProductList from "./List"
import ProductDetail from "./Detail"
import { AdminProviderProductDraftProvider } from "hooks/commerce";
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"

export default () => {
	const { productID, skuID } = useParams()

	return (
		<AdminProviderProductDraftProvider id={productID}>
			<Box>
				<Grid container alignItems="stretch" spacing={0} style={{ width: "100%" }}>
					<Content />
				</Grid>
			</Box>
		</AdminProviderProductDraftProvider >
	)
}

const Content = () => {

	const theme = useTheme();
	const { productID, skuID } = useParams()
	const matches = useMediaQuery(theme.breakpoints.down("sm"));

	if (matches) {
		if (productID) {
			return (
				<NavigationView>
					<ContentView>
						<ProductDetail />
					</ContentView>
				</NavigationView>
			)
		}

		return (
			<NavigationView>
				<ListView height="100%">
					<ProductList />
				</ListView>
			</NavigationView>
		)
	}

	return (
		<NavigationView>
			<ListView height="100%">
				<ProductList />
			</ListView>
			<Divider orientation="vertical" flexItem />
			<ContentView>
				<ProductDetail />
			</ContentView>
		</NavigationView>
	)
}
