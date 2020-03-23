import React, { useEffect } from 'react'
import { StaticRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Provider from 'components/providers/ProviderList'

import firebase from 'firebase'
import 'firebase/auth'
import { UserContext, UserProvider } from 'context'
import { Button } from '@material-ui/core'

export default () => {
	const history = createMemoryHistory()
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/providers">Provider</Link>
						</li>
						<li>
							<Link to="/users">Users</Link>
						</li>
					</ul>
				</nav>

				{/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
				<Switch>
					<Route path="/providers">
						<Provider />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}
