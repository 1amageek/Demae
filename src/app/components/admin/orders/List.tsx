
import React, { useState } from "react"
import firebase from "firebase"
import { Link } from "react-router-dom"
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Grid, Typography, Chip, IconButton, Divider, Avatar } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { useAdminProviderOrders, useAdminProvider } from "hooks/commerce";
import DataLoading from "components/DataLoading";
import SegmentControl, { useSegmentControl } from "components/SegmentControl"
import { useHistory, useParams } from "react-router-dom";
import { Order } from "models/commerce";
import { useDataSourceListen, Where, OrderBy } from "hooks/firestore"
import { useListHeader } from "components/NavigationContainer"
import { useSalesMethod, deliveryStatusesForSalesMethod, DeliveryStatusLabel, PaymentStatusLabel, SalesMethodLabel } from "hooks/commerce/SalesMethod"
import Dayjs from "dayjs"

export default () => {
	const classes = useStyles();
	const history = useHistory()
	const { orderID } = useParams()
	const salesMethod = useSalesMethod()
	const salesMethodLables = deliveryStatusesForSalesMethod(salesMethod).concat({
		label: "ALL",
		value: undefined
	})
	const [segmentControl] = useSegmentControl(salesMethodLables.map(tab => tab.label))
	const deliveryStatus = salesMethodLables.map(tab => tab.value)[segmentControl.selected]
	const [provider, waiting] = useAdminProvider()
	const collectionReference = provider ? provider.orders.collectionReference : undefined
	const wheres = [
		salesMethod ? Where("salesMethod", "==", salesMethod) : undefined,
		deliveryStatus ? Where("deliveryStatus", "==", deliveryStatus) : undefined,
		// paymentStatus ? Where("paymentStatus", "==", paymentStatus) : undefined
	].filter(value => !!value)
	const [orderBy, setOrderBy] = useState<firebase.firestore.OrderByDirection>("desc")
	const [orders, isLoading] = useDataSourceListen<Order>(Order, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy("createdAt", orderBy)
	}, waiting)


	useListHeader(() => {
		return (
			<>
				<Box padding={1} paddingTop={2}>
					<Typography variant="h1">Order</Typography>
				</Box>
				<Box padding={1}>
					<SegmentControl {...segmentControl} />
				</Box>
			</>
		)
	})

	if (isLoading) {
		return (
			<DataLoading />
		)
	}

	return (
		<Box height="100%">
			<List data={orders} />
		</Box>
	)
}

const List = ({ data }: { data: Order[] }) => {
	return (
		<Box>
			{
				data.map((data, index) => {
					return <ListItem key={index} data={data} />
				})
			}
		</Box>
	)
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		list: {
			textDecoration: "none",
			color: "inherit",
			"& > *:hover": {
				backgroundColor: "rgba(0, 0, 0, 0.018)"
			},
		},
		tags: {
			display: 'flex',
			flexWrap: 'wrap',
			marginTop: theme.spacing(1),
			'& > *': {
				margin: theme.spacing(0.3),
			},
		},
	}),
);

const ListItem = ({ data }: { data: Order }) => {
	const classes = useStyles();
	const { orderID } = useParams()
	const salesMethod = useSalesMethod()
	const orderedDate = Dayjs(data.createdAt.toDate())
	const currency = data.currency
	const amount = data.amount || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency }).format(amount)
	const imageURL = data.imageURLs().length > 0 ? data.imageURLs()[0] : undefined

	return (
		<Link className={classes.list} to={`/admin/orders/${data.id}` + (salesMethod ? `?salesMethod=${salesMethod}` : "")}>
			<Box>
				<Box padding={1} paddingY={2} style={{
					backgroundColor: orderID === data.id ? "rgba(0, 0, 140, 0.03)" : "inherit"
				}}>
					<Grid container>
						<Grid item xs={1}>
						</Grid>
						<Grid item xs={2}>
							<Avatar variant="rounded" src={imageURL} >
								<ImageIcon />
							</Avatar>
						</Grid>
						<Grid item xs={9}>
							<Box display="flex" justifyContent="space-between">
								<Box>
									<Typography variant="subtitle1">{data.title}</Typography>
									<Typography variant="body2">{data.id}</Typography>
									<Typography variant="caption">
										{orderedDate.format("YYYY-MM-DD HH:mm:ss")}
									</Typography>
								</Box>
							</Box>
							<Box className={classes.tags}>
								<Chip size="small" label={DeliveryStatusLabel[data.deliveryStatus]} />
								<Chip size="small" label={SalesMethodLabel[data.salesMethod]} />
								<Chip size="small" label={PaymentStatusLabel[data.paymentStatus]} />
								{
									data.tags.map((tag, index) => {
										return <Chip key={index} size="small" label={tag} />
									})
								}
							</Box>
						</Grid>
					</Grid>
				</Box>
				<Divider />
			</Box>
		</Link>
	)
}
