import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline'
import TabBar from 'components/TabBar'
import Home from 'components/home'
import Cart from 'components/cart'

export default () => {
	return (
		<>
			<Container maxWidth="sm">
				<CssBaseline />
				<App />
			</Container>
			<TabBar />
		</>
	);
}

const App = () => {
	return (
		<Switch>
			<Route path={`/home`} exact component={Home} />
			<Route path={`/cart`} component={Cart} />
		</Switch>
	)
}
