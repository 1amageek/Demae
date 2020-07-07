import React from "react"
import Head from "next/head"
import { OpenGraph } from "@1amageek/open-graph-protocol"

interface Props {
	title: string
	description: string
	url: string
	og?: any
	twitter?: Twitter
}

interface Twitter {
	card: string
	site?: string
	creator?: string
	url: string
	title: string
	description: string
	image: string
}

export default ({ title, description, url, og, twitter }: Props) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} />
			{og && OpenGraph.build({ og }, (key, value) => { return { property: key, content: value } }).map((value, index) => <meta key={index} {...value} />)}
			{twitter && OpenGraph.build({ twitter }, (key, value) => { return { name: key, content: value } }).map((value, index) => <meta key={index} {...value} />)}
			<link rel="canonical" href={url} />
			<link rel="shortcut icon" href={"https://t-cr.jp/favicon.ico"} />
			<link rel="apple-touch-icon" href={"https://t-cr.jp/logo.png"} />
		</Head>
	);
};
