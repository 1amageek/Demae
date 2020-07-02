
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { useParams } from "react-router-dom"
import { Box, Hidden } from "@material-ui/core";
import SKUList from "./List"
// import SKUList from "./Detail"
import { AdminProviderProductProvider, AdminProviderProductSKUProvider } from "hooks/commerce";
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
		if (productID && skuID) {
			return (
				<Grid item xs={12}>
					{/* <SKUDetail productID={productID} skuID={skuID} /> */}
				</Grid>
			)
		}

		if (productID) {
			return (
				<NavigationView>
					<ListView height="100%">
						<SKUList />
					</ListView>
					<ContentView>
						{/* <ProductDetail /> */}
					</ContentView>
				</NavigationView>
			)
		}

		return (
			<NavigationView>
				<ListView height="100%">
					<SKUList />
				</ListView>
			</NavigationView>
		)
	}

	return (
		<NavigationView>
			<ListView height="100%">
				<SKUList />
			</ListView>
			<ContentView>
				{/* <ProductDetail /> */}
			</ContentView>
		</NavigationView>
	)
}
