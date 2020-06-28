
import React from "react"
import { Link, useHistory, useParams, useLocation } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Grid from "@material-ui/core/Grid";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Box, Hidden, Typography } from "@material-ui/core";
import { AdminProviderOrderProvider } from "hooks/commerce";
import List from "./List"
import Detail from "./Detail"
import { DeliveryStatus, PaymentStatus } from "common/commerce/Types"
import { NavigationView, ListView, ContentView } from "components/NavigationContainer"

export default () => {
	const { orderID } = useParams()

	return (
		<AdminProviderOrderProvider id={orderID}>
			<Box>
				<Content />
			</Box>
		</AdminProviderOrderProvider>
	)
}


const Content = () => {
	const { orderID } = useParams()
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down("sm"));

	if (matches) {
		if (orderID) {
			return (
				<Grid container alignItems="stretch" spacing={0} style={{ width: "100%" }}>
					<Grid item xs={12}>
						<Detail orderID={orderID} />
					</Grid>
				</Grid>
			)
		}

		return (
			<Grid container alignItems="stretch" spacing={0} style={{ width: "100%" }}>
				<Grid item xs={12}>
					<List />
				</Grid>
			</Grid>
		)
	}

	return (
		<NavigationView>
			<ListView height="100%">
				<List />
			</ListView>
			<ContentView>
				<Detail orderID={orderID} />
			</ContentView>
		</NavigationView>
	)
}
