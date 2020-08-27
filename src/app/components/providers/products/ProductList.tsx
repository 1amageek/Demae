import React, { useState } from "react";
import { useParams } from "react-router-dom"
import { Box, Paper, Typography, Divider, Grid, Tabs, Tab } from "@material-ui/core";
import Card from "./Card"
import { useDataSourceListen, Where } from "hooks/firestore";
import { Provider, Product } from "models/commerce";
import DataLoading from "components/DataLoading"
import { useCapability, deliveryMethodForProviderCapability } from "hooks/commerce/ProviderCapabilities"

export default () => {
	const { providerID } = useParams()
	const capability = useCapability()
	const deliveryMethod = deliveryMethodForProviderCapability(capability)
	const ref = new Provider(providerID).products.collectionReference
	const wheres = [
		Where("isAvailable", "==", true),
		deliveryMethod ? Where("deliveryMethod", "==", deliveryMethod) : undefined,
	].filter(value => !!value)
	const [data, isLoading] = useDataSourceListen<Product>(Product,
		{
			path: ref.path,
			wheres,
			limit: 30
		})

	if (isLoading) {
		return (
			<DataLoading />
		)
	}

	return (
		<Box padding={2}>
			<Grid container spacing={2}>
				{data.map(doc => {
					return (
						<Grid item xs={6} key={doc.id}>
							<Card providerID={providerID} product={doc} />
						</Grid>
					)
				})}
			</Grid>
		</Box>
	)
}
