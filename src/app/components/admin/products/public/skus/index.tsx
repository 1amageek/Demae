
import React from "react"
import { useParams } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import { Box, Hidden, Divider } from "@material-ui/core";
import SKUList from "./List"
import SKUDetail from "./Detail"
import { AdminProviderProductProvider } from "hooks/commerce";
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"

export default () => {
	const { productID, skuID } = useParams()

	return (
		<AdminProviderProductProvider id={productID}>
			<Box>
				<Grid container alignItems="stretch" spacing={0} style={{ width: "100%" }}>
					<Content />
				</Grid>
			</Box>
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
