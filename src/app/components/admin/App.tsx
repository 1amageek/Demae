import React from "react"
import { Switch, Route, Redirect } from "react-router-dom"
import { makeStyles, useTheme, Theme, createStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container"

import ProductDrafts from "components/admin/products/drafts"
import SKUDrafts from "components/admin/products/drafts/skus"
import Product from "components/admin/products/public"
import SKU from "components/admin/products/public/skus"
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
			overflowX: "hidden"
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
			<Route path={`/admin/products`} exact>
				<Redirect to={`/admin/products/public`} />
			</Route>
			<Route path={`/admin/products/public`} exact component={Product} />
			<Route path={`/admin/products/public/:productID`} exact component={Product} />
			<Route path={`/admin/products/public/:productID/skus`} exact component={SKU} />
			<Route path={`/admin/products/public/:productID/skus/:skuID`} exact component={SKU} />
			<Route path={`/admin/products/drafts`} exact component={ProductDrafts} />
			<Route path={`/admin/products/drafts/:productID`} exact component={ProductDrafts} />
			<Route path={`/admin/products/drafts/:productID/skus`} exact component={SKUDrafts} />
			<Route path={`/admin/products/drafts/:productID/skus/:skuID`} exact component={SKUDrafts} />
			<Route path={`/admin/orders`} exact component={Order} />
			<Route path={`/admin/orders/:orderID`} exact component={Order} />
			<Route path={`/admin/provider`} exact component={Provider} />
			<Route path={`/admin/account`} exact component={Account} />
		</Switch>
	)
}
