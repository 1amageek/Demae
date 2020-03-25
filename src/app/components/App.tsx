import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline'
import TabBar from 'components/TabBar'
import Home from 'components/home'
import Cart from 'components/cart'
import Provider from 'components/providers'
import Checkout from 'components/checkout'
import Shipping from 'components/checkout/shipping'
import PaymentMethod from 'components/checkout/payment'

export default () => {
	return (
		<>
			<div>
				<Container maxWidth="sm">
					<CssBaseline />
					<App />
				</Container>
			</div>
			<TabBar />
		</>
	);
}

const App = () => {
	return (
		<Switch>
			<Route path={`/home`} exact component={Home} />
			<Route path={`/cart`} component={Cart} />
			<Route path={`/providers`} component={Provider} />
			<Route path={`/checkout`} component={Checkout} />
			<Route path={`/checkout/shipping/:id`} component={Shipping} />
			<Route path={`/checkout/shipping`} component={Shipping} />
			<Route path={`/checkout/paymentMethod/:id`} component={PaymentMethod} />
			<Route path={`/checkout/paymentMethod`} component={PaymentMethod} />
		</Switch>
	)
}
