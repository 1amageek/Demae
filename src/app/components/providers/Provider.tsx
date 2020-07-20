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
import { Capability } from "models/commerce/Provider"
import { Capabilities, CapabilityLabel, useCapability } from "hooks/commerce/ProviderCapabilities"

export default () => {

	const { providerID } = useParams()
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

const CapabilityTabs = ({ provider }: { provider: Provider }) => {
	const hisotry = useHistory()
	const providerCapabilities = provider.capabilities || []
	const capability: Capability = useCapability() || (providerCapabilities.length > 0 ? providerCapabilities[0] : "online_sales")
	const capabilities: Capability[] = provider?.capabilities || []
	const value = Capabilities.includes(capability) ? capabilities.indexOf(capability) : 0
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
				onChange={handleChange}
			>
				{
					capabilities.map(value => {
						return <Tab key={value} label={CapabilityLabel[value]} />
					})
				}
			</Tabs>
		</>
	)
}
