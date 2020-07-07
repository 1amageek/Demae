import React from "react"
import { GetServerSidePropsContext } from "next"
import App from "components/App"
import Head from "components/Head"
import Provider from "models/commerce/Provider"
import { OpenGraph } from "@1amageek/open-graph-protocol"

export default ({ title, description, url, og, twitter }) => {
	return (
		<>
			<Head title={title} description={description} url={url} og={og} twitter={twitter} />
			<App />
		</>
	)
}

export async function getServerSideProps(context: GetServerSidePropsContext<{
	providerID: string
}>) {
	const { params } = context
	if (!params) return { props: {} }
	const provider = await Provider.get<Provider>(params.providerID)
	if (!provider) return { props: {} }
	const data = provider.data()
	const { name, caption, description } = data
	const title = `${name} ${caption}`
	const url = context.req.url
	const image = provider.thumbnailImageURL() || "" // TODO: Default Image
	const og: OpenGraph.Metadata<"website"> = {
		type: "website",
		title,
		image,
		description,
		url: `${process.env.HOST}${url}`,
	}

	const site = provider.sns?.twitter
	const creator = site
	let twitter = {
		card: "summary_large_image",
		title,
		image,
		description,
		url: `${process.env.HOST}${url}`,
	}
	if (site) twitter["site"] = site
	if (creator) twitter["creator"] = creator
	return {
		props: { title, description, url, og, twitter }
	}
}
