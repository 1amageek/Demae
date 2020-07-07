import React from "react"
import { GetServerSidePropsContext } from "next"
import App from "components/App"
import Head from "components/Head"
import Provider from "models/commerce/Provider"
import Product from "models/commerce/Product"
import SKU from "models/commerce/SKU"
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
	productID: string,
	skuID: string
}>) {
	const { params } = context
	if (!params) return { props: {} }
	const [provider, product, sku] = await Promise.all([
		Provider.get<Provider>(params.providerID),
		Product.get<Product>(new Provider(params.providerID).products.collectionReference.doc(params.productID)),
		SKU.get<SKU>(new Provider(params.providerID).products.collectionReference.doc(params.productID).collection("skus").doc(params.skuID))
	])
	if (!sku || !product) return { props: {} }
	const title = `${sku.name} ${sku.caption || ""} - ${product.name}`
	const url = context.req.url
	const productImage = (product.imageURLs().length > 0) ? product.imageURLs()[0] : ""
	const image = (sku.imageURLs().length > 0) ? sku.imageURLs()[0] : productImage
	const description = sku.description
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
