import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import Product from 'components/admin/products'
import Layout from './Layout'
import Dashboard from 'components/admin/dashboard'
import Provider from 'components/admin/provider'
import { AdminProviderProvider } from 'hooks/commerce';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		content: {
			flexGrow: 1,
			padding: theme.spacing(2, 0),
		}
	})
);

export default () => {
	return (
		<AdminProviderProvider>
			<Route path="/" component={Root} />
		</AdminProviderProvider>
	);
}

const Root = () => {
	const classes = useStyles()
	return (
		<>
			<Layout>
				<main className={classes.content}>
					<Container maxWidth='xl'>
						<CssBaseline />
						<App />
					</Container>
				</main>
			</Layout>
		</>
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
		</Switch>
	)
}
