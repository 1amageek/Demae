import React from "react"
import App from "components/App"
import Head from "components/Head"

export default () => (
	<>
		<Head title="Deamae" description="SaaS" url={`${process.env.HOST}/`} />
		<App />
	</>
)
