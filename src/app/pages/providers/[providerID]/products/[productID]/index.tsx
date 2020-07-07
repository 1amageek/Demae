import React from "react"
import { GetServerSidePropsContext } from "next"
import App from "components/App"
import Head from "components/Head"
import Provider from "models/commerce/Provider"
import Product from "models/commerce/Product"
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
	providerID: string,
	productID: string
}>) {
	const { params } = context
	if (!params) return { props: {} }
	const [provider, product] = await Promise.all([
		Provider.get<Provider>(params.providerID),
		Product.get<Product>(new Provider(params.providerID).products.collectionReference.doc(params.productID)),
	])
	if (!product) return { props: {} }
	const title = `${product.name} ${product.caption || ""}`
	const url = context.req.url
	const image = (product.imageURLs().length > 0) ? product.imageURLs()[0] : "" // TODO: Default Image
	const description = product.description
	const og: OpenGraph.Metadata<"product"> = {
		type: "product",
		title,
		image,
		description,
		url: `${process.env.HOST}${url}`,
		product: {
			price: []
		}
	}

	const site = provider?.sns?.twitter
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
