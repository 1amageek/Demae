import React from "react"
import App from "components/App"
import Head from "components/Head"
import AppConfigure from "config/AppConfigure"

export default () => (
	<>
		<Head title={AppConfigure.name} description="SaaS" url={`${process.env.HOST}/`} />
		<App />
	</>
)
