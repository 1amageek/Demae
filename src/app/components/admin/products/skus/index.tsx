
import React, { useState } from "react"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import { useParams } from "react-router-dom"
import { Box, Hidden, Divider } from "@material-ui/core";
import SKUList from "./List"
import SKUDetail from "./Detail"
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
	const { skuID } = useParams()
	const matches = useMediaQuery(theme.breakpoints.down("sm"));

	if (matches) {
		if (skuID) {
			return (
				<NavigationView>
					<ContentView>
						<SKUDetail />
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
			<Divider orientation="vertical" flexItem />
			<ContentView>
				<SKUDetail />
			</ContentView>
		</NavigationView>
	)
}
