import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom"
import { Divider, Grid, Tabs, Tab, Box, Avatar } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import DataLoading from "components/DataLoading";
import ProductList from "components/providers/products/ProductList"
import { useDocumentListen } from "hooks/firestore";
import { Provider } from "models/commerce";
import NotFound from "components/NotFound"
import ActionBar from "components/ActionBar"
import { Capabilities, CapabilityLabel, useCapability } from "hooks/commerce/ProviderCapabilities"

export default () => {

	const { providerID } = useParams<{ providerID?: string }>()
	const [data, isLoading] = useDocumentListen<Provider>(Provider, Provider.collectionReference().doc(providerID))

	if (isLoading) {
		return <DataLoading />
	}
	if (!data) {
		return <NotFound />
	}
	return (
		<>
			<Avatar variant="square" src={data.coverImageURL()} alt={data.name} style={{
				minHeight: "300px",
				maxHeight: "400px",
				height: "100%",
				width: "100%"
			}}>
				<ImageIcon />
			</Avatar>
			<Box paddingX={1}>
				<ActionBar />
			</Box>

			{data.capabilities && <CapabilityTabs provider={data} />}

			<ProductList />
		</>
	)
}

export const TabLabel = {
	"all": "ALL",
	"download": "DOWNLOAD",
	"instore": "INSTORE",
	"online": "ONLINE",
	"pickup": "PICKUP"
}

const CapabilityTabs = ({ provider }: { provider: Provider }) => {
	const hisotry = useHistory()
	const providerCapabilities = provider.capabilities || []
	const capability: any = useCapability() || (providerCapabilities.length > 0 ? providerCapabilities[0] : "all")
	const capabilities: any[] = ["all"].concat(provider?.capabilities || [])
	const value = ["all"].concat(Capabilities).includes(capability) ? capabilities.indexOf(capability) : 0
	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		const capability = capabilities[newValue]
		hisotry.push(`/providers/${provider.id}?capability=${capability}`)
	};
	return (
		<>
			<Divider />
			<Tabs
				value={value}
				indicatorColor="primary"
				textColor="primary"
				variant="fullWidth"
				scrollButtons="auto"
				onChange={handleChange}
			>
				{
					capabilities.map(value => {
						return <Tab key={value} fullWidth label={TabLabel[value]} />
					})
				}
			</Tabs>
		</>
	)
}
