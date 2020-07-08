
import React, { useState } from "react"
import firebase from "firebase"
import { Box, Paper, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ImageIcon from "@material-ui/icons/Image";
import { useAdminProviderOrders, useAdminProvider } from "hooks/commerce";
import DataLoading from "components/DataLoading";
import SegmentControl, { useSegmentControl } from "components/SegmentControl"
import Board from "../Board";
import { useHistory, useParams } from "react-router-dom";
import { Order } from "models/commerce";
import { useDataSourceListen, Where, OrderBy } from "hooks/firestore"
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod, DeliveryStatusLabel, PaymentStatusLabel } from "hooks/commerce/DeliveryMethod"
import Dayjs from "dayjs"
import Label from "components/Label";

export default () => {

	const history = useHistory()
	const { orderID } = useParams()
	const deliveryMethod = useDeliveryMethod()
	const tabs = deliveryStatusesForDeliveryMethod(deliveryMethod)
	const [segmentControl] = useSegmentControl(tabs.map(tab => tab.label))
	const deliveryStatus = tabs.map(tab => tab.value)[segmentControl.selected]
	const [provider, waiting] = useAdminProvider()

	const collectionReference = provider ? provider.orders.collectionReference : undefined
	const wheres = [
		deliveryMethod ? Where("deliveryMethod", "==", deliveryMethod) : undefined,
		deliveryStatus ? Where("deliveryStatus", "==", deliveryStatus) : undefined,
		// paymentStatus ? Where("paymentStatus", "==", paymentStatus) : undefined
	].filter(value => !!value)
	const [orderBy, setOrderBy] = useState<firebase.firestore.OrderByDirection>("desc")
	const [orders, isLoading] = useDataSourceListen<Order>(Order, {
		path: collectionReference?.path,
		wheres: wheres,
		orderBy: OrderBy("createdAt", orderBy)
	}, waiting)

	if (isLoading) {
		return (
			<Box height="100%">
				<Box padding={1} paddingTop={2}>
					<Typography variant="h1">Order</Typography>
				</Box>
				<Box padding={1}>
					<SegmentControl {...segmentControl} />
				</Box>
				<DataLoading />
			</Box>
		)
	}

	return (
		<Box height="100%">
			<Box padding={1} paddingTop={2}>
				<Typography variant="h1">Order</Typography>
			</Box>
			<Box padding={1}>
				<SegmentControl {...segmentControl} />
			</Box>
			<List style={{
				height: "100%"
			}}>
				{orders.map(data => {
					const orderedDate = Dayjs(data.createdAt.toDate())
					return (
						<ListItem key={data.id} button alignItems="flex-start" selected={orderID === data.id} onClick={() => {
							history.push(`/admin/orders/${data.id}` + (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : ""))
						}}>
							<ListItemAvatar>
								<Avatar variant="rounded" src={data.imageURLs()[0]}>
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={
								<>
									<Typography variant="subtitle1">
										{data.title}
									</Typography>
									<Typography variant="body2">
										{`ID: ${data.id}`}
									</Typography>
									<Typography variant="caption">
										{orderedDate.format("YYYY-MM-DD HH:mm:ss")}
									</Typography>
									<Box display="flex" paddingY={1}>
										<Label color="gray" fontSize={12}>{DeliveryStatusLabel[data.deliveryStatus]}</Label>
										<Label color="gray" fontSize={12}>{PaymentStatusLabel[data.paymentStatus]}</Label>
									</Box>
								</>
							} />
						</ListItem>
					)
				})}
			</List>
		</Box>
	)
}

