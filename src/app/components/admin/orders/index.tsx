
import React from "react"
import { useParams } from "react-router-dom"
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Box, Divider } from "@material-ui/core";
import { AdminProviderOrderProvider } from "hooks/commerce";
import List from "./List"
import Detail from "./Detail"
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
				<NavigationView>
					<ListView height="100%">
						<Detail orderID={orderID} />
					</ListView>
				</NavigationView>
			)
		}

		return (
			<NavigationView>
				<ListView height="100%">
					<List />
				</ListView>
			</NavigationView>
		)
	}

	return (
		<NavigationView>
			<ListView height="100%">
				<List />
			</ListView>
			<Divider orientation="vertical" flexItem />
			<ContentView>
				<Detail orderID={orderID} />
			</ContentView>
		</NavigationView>
	)
}
