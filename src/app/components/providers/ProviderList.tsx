import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Grid, Paper, Typography, Box } from "@material-ui/core";
import Card from "./Card"
import DataLoading from "components/DataLoading"
import { useDataSourceListen, Where } from "hooks/firestore";
import { Provider } from "models/commerce";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		paper: {
			padding: theme.spacing(2),
			margin: "auto",
			maxWidth: 500,
		},
		image: {
			width: 128,
			height: 128,
		},
		img: {
			margin: "auto",
			display: "block",
			maxWidth: "100%",
			maxHeight: "100%",
		},
	}),
);

export default () => {
	const ref = Provider.collectionReference()
	const [data, isLoading] = useDataSourceListen<Provider>(Provider,
		{
			path: ref.path,
			wheres: [
				Where("isAvailable", "==", true)
			],
			limit: 30
		})

	if (isLoading) {
		return <DataLoading />
	}

	if (data.length === 0) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" paddingY={12}>
				<Typography variant="subtitle1" color="textSecondary">There is no providers.</Typography>
			</Box>
		)
	}

	return (
		<Grid container spacing={2}>
			{data.map(doc => {
				return (
					<Grid key={doc.id} item xs={12} container>
						<Card provider={doc} />
					</Grid>
				)
			})}
		</Grid>
	);
}
