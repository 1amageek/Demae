import React from "react"
import { Switch, Route } from "react-router-dom"
import { makeStyles, useTheme, Theme, createStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Product from "components/admin/products"
import Order from "components/admin/orders"
import Layout from "./Layout"
import Dashboard from "components/admin/dashboard"
import Provider from "components/admin/provider"
import Account from "components/admin/account"
import { AdminProviderProvider } from "hooks/commerce";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		content: {
			flexGrow: 1,
		}
	})
);

export default () => {
	const classes = useStyles()
	return (
		<AdminProviderProvider>
			<Layout>
				<main className={classes.content}>
					<Container maxWidth="xl" disableGutters>
						<App />
					</Container>
				</main>
			</Layout>
		</AdminProviderProvider>
	);
}

const App = () => {
	return (
		<Switch>
			<Route path={`/admin`} exact component={Dashboard} />
			<Route path={`/admin/products`} exact component={Product} />
			<Route path={`/admin/products/:productID`} exact component={Product} />
			<Route path={`/admin/products/:productID/skus`} exact component={Product} />
			<Route path={`/admin/products/:productID/skus/:skuID`} exact component={Product} />
			<Route path={`/admin/orders`} exact component={Order} />
			<Route path={`/admin/orders/:orderID`} exact component={Order} />
			<Route path={`/admin/provider`} exact component={Provider} />
			<Route path={`/admin/account`} exact component={Account} />
		</Switch>
	)
}
