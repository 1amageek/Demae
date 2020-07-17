
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Grid, Divider, Box, Hidden } from "@material-ui/core";
import { useParams } from "react-router-dom"
import ProductList from "./List"
import ProductDetail from "./Detail"
import { AdminProviderProductProvider, AdminProviderProductSKUProvider } from "hooks/commerce";
import SKUList from "./skus/List";
import SKUDetail from "./SKUDetail";
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"

export default (props: any) => {
	const { productID, skuID } = props.match.params

	return (
		<AdminProviderProductProvider id={productID}>
			<AdminProviderProductSKUProvider id={skuID}>
				<Box>
					<Grid container alignItems="stretch" spacing={0} style={{ width: "100%" }}>
						<Content />
					</Grid>
				</Box>
			</AdminProviderProductSKUProvider>
		</AdminProviderProductProvider >
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
