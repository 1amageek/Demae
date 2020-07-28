import React from "react";
import { useHistory } from "react-router-dom"
import { Grid, Box, Paper } from "@material-ui/core";
import { Provider, Product } from "models/commerce";
import DataLoading from "components/DataLoading";
import SKUList from "./skus/SKUList";
import { useDocumentListen } from "hooks/firestore";
import NotFound from "components/NotFound"
import ActionBar from "components/ActionBar"
import MediaCard from "components/MediaCard"
import { DeliveryMethodLabel, capabilityForDeliveryMethod } from "hooks/commerce/DeliveryMethod"
import { useImage } from "utils/ImageManager"
import { useTheme } from "@material-ui/core/styles";

export default ({ providerID, productID }: { providerID: string, productID: string }) => {
	const theme = useTheme()
	const hisotry = useHistory()
	const [data, isLoading] = useDocumentListen<Product>(Product, new Provider(providerID).products.collectionReference.doc(productID))
	const imageURL = (data?.imagePaths() || []).length > 0 ? data?.imagePaths()[0] : undefined
	const imgProps = useImage({ path: imageURL, alt: `${data?.name ?? ""}` })
	const capability = capabilityForDeliveryMethod(data?.deliveryMethod)
	if (isLoading) {
		return <DataLoading />
	}
	if (!data) {
		return <NotFound />
	}
	return (
		<>
			<Box
				width="100%"
				height="100%"
			>
				<Box position="relative">
					<Box position="absolute" zIndex="mobileStepper" padding={2}>
						<Box
							fontWeight={800}
							onClick={() => {
								hisotry.push(`/providers/${providerID}?capability=${capability}`)
							}}
						>
							<Paper elevation={1} style={{
								padding: theme.spacing(1),
								paddingTop: theme.spacing(0.5),
								paddingBottom: theme.spacing(0.5),
								width: "100%",
								height: "100%",
								backgroundColor: "rgba(255, 255, 255, 0.6)",
								backdropFilter: "blur(20px)",
								WebkitBackdropFilter: "blur(20px)",
								cursor: "pointer"
							}}>
								{DeliveryMethodLabel[data.deliveryMethod]}
							</Paper>
						</Box>
					</Box>
					<MediaCard imageProps={imgProps} />
				</Box>
			</Box>
			<Box paddingX={1}>
				<ActionBar />
			</Box>
			<Box padding={2}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<SKUList providerID={providerID} productID={productID} />
					</Grid>
				</Grid>
			</Box>
		</>
	)
}
