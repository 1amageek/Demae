import React, { useEffect } from 'react'
import { StaticRouter, BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Provider from 'components/providers/ProviderList'

import firebase from 'firebase'
import 'firebase/auth'

const isServer = typeof window === 'undefined';

const Profile = () => <div>You're on the Profile Tab</div>;
const Comments = () => <div>You're on the Comments Tab</div>;
const Contact = () => <div>You're on the Contact Tab</div>;

export default () => {

	if (process.browser) {
		return (
			<BrowserRouter>
				<Swicher />
			</BrowserRouter>
		)
	} else {
		return (
			<StaticRouter>
				<Swicher />
			</StaticRouter>
		)
	}
}

const Swicher = () => {
	return <Switch>
		<Route path="/" component={App} />
	</Switch>
}

const App = () => {
	return (
		<div>
			<h1>Hey welcome home!</h1>
			<div className="links">
				<Link to={`/`} className="link">Profile</Link>
				<Link to={`/comments`} className="link">Comments</Link>
				<Link to={`/contact`} className="link">Contact</Link>
			</div>
			<div className="tabs">
				<Switch>
					<Route path={`/`} exact component={Profile} />
					<Route path={`/comments`} component={Comments} />
					<Route path={`/contact`} component={Contact} />
				</Switch>
			</div>
		</div>
	);
}
