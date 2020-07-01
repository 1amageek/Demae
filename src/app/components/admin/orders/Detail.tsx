
import React, { useState } from "react"
import firebase from "firebase"
import { DeliveryStatus } from "common/commerce/Types"
import { Typography, Box, Paper, FormControl, Button } from "@material-ui/core";
import Input, { useInput } from "components/Input"
// import Select, { useSelect } from "components/Select"
import { List, ListItem, ListItemText, ListItemAvatar, ListItemIcon, Divider } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ImageIcon from "@material-ui/icons/Image";
import { useAdminProvider, useAdminProviderOrder, } from "hooks/commerce";
import DataLoading from "components/DataLoading";
import Board from "../Board";
import { useHistory } from "react-router-dom";
import { SKU, User } from "models/commerce";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import Select, { useSelect, useMenu } from "components/_Select"
import Order from "models/commerce/Order"
import * as Social from "models/social"
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod, DeliveryStatusLabel, PaymentStatusLabel } from "./helper"
import Dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime';
import Label from "components/Label";
import { useDocumentListen, useDataSourceListen, OrderBy } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import { Activity, Comment, ChangeDeliveryStatus } from "models/commerce/Order"
import { useAuthUser } from "hooks/auth";
import { Batch } from "@1amageek/ballcap";

Dayjs.extend(relativeTime)

export default ({ orderID }: { orderID?: string }) => {
	const theme = useTheme();
	const [auth] = useAuthUser()
	const [order, isLoading] = useAdminProviderOrder(orderID)
	const deliveryMethod = useDeliveryMethod()
	const deliveryMethodQuery = (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : "")

	const [showDrawer, onClose] = useDrawer()
	const [showSnackbar] = useSnackbar()

	const deliveryStatuses = deliveryStatusesForDeliveryMethod(order?.deliveryMethod) as any[]
	const deliveryStatusMenu = useMenu(deliveryStatuses)
	const [deliveryStatus, setStatus] = useSelect(order?.deliveryStatus)

	const onChageStatus = async (e) => {
		e.preventDefault()
		if (!auth) return
		const status = String(e.target.value) as DeliveryStatus
		if (status === "in_transit") {
			showDrawer(<ActionSheet onNext={async () => {
				if (!order) return
				if (!order.paymentResult) return
				const paymentIntentID = order.paymentResult.id
				const orderID = order.id
				const capture = firebase.functions().httpsCallable("commerce-v1-checkout-capture")
				try {
					const response = await capture({ paymentIntentID, orderID })
					const { error, result } = response.data
					if (error) {
						showSnackbar("error", error.message)
						console.error(error)
					} else {
						setStatus(status)
						showSnackbar("success", "The product has been shipped.")
						console.log(result)
					}
					onClose()
				} catch (error) {
					console.error(error)
					onClose()
				}
			}} onClose={onClose} />)
		} else {

			if (!order) return

			const changeDeliveryStatus = new ChangeDeliveryStatus()
			changeDeliveryStatus.beforeStatus = deliveryStatus.value as DeliveryStatus
			changeDeliveryStatus.afterStatus = status as DeliveryStatus

			const activity = new Activity(order.activities.collectionReference.doc())
			activity.authoredBy = auth.uid
			activity.changeDeliveryStatus = changeDeliveryStatus

			order.deliveryStatus = status

			const batch = new Batch()
			batch.save(activity)
			batch.save(order)

			try {
				await batch.commit()
				setStatus(status)
				showSnackbar("success", "Change status.")
			} catch (error) {
				console.error(error)
				showSnackbar("error", "Fialure.")
			}
		}
	}

	if (isLoading) {
		return (
			<Box padding={2} height="100%" display="flex" alignItems="center">
				<DataLoading />
			</Box>
		)
	}

	if (!order) {
		return (
			<Paper elevation={0} style={{
				height: "100%"
			}}>
				<Box padding={2} height="100%" display="flex" justifyContent="center" alignItems="center">
					<Typography variant="subtitle1" color="textSecondary">No item is selected.</Typography>
				</Box>
			</Paper>
		)
	}

	const orderedDate = Dayjs(order.createdAt.toDate())
	return (
		<Paper elevation={0} style={{
			height: "100%"
		}}>
			<Box padding={2} height="100%">
				<article>
					<Box paddingBottom={1} display="flex">
						<Box flexGrow={1}>
							<Typography variant="h2">{order.title}</Typography>
							<Box color="text.secondary">
								<Typography variant="caption">
									{`ID: ${order.id}`} - {orderedDate.format("YYYY-MM-DD HH:mm:ss")}
								</Typography>
							</Box>
							<Box display="flex" paddingY={1}>
								<Typography variant="subtitle1">
									Delivery Status <Label marginX={1} color="gray" fontSize={11}>{DeliveryStatusLabel[order.deliveryStatus]}</Label>
									Payment Status <Label marginX={1} color="gray" fontSize={11}>{PaymentStatusLabel[order.paymentStatus]}</Label>
								</Typography>
							</Box>
						</Box>
						<Box>
							<FormControl variant="outlined" size="small">
								<Select disabled={deliveryStatus.value === "none"} {...deliveryStatus} onChange={onChageStatus}>
									{deliveryStatusMenu}
								</Select>
							</FormControl>
						</Box>
					</Box>
					<Divider />
					<Box paddingY={2}>
						<Box
							border={1}
							borderColor={theme.palette.grey[300]}
							borderRadius={8}
							padding={2}
							marginBottom={1}
						>
							<Typography variant="h3" gutterBottom>Items</Typography>
							<Paper>
								<List>
									{order.items.map(data => {
										const image = (data.imageURLs().length > 0) ? data.imageURLs()[0] : undefined
										return (
											<ListItem key={data.skuReference?.path}>
												<ListItemAvatar>
													<Avatar variant="rounded" src={image} >
														<ImageIcon />
													</Avatar>
												</ListItemAvatar>
												<ListItemText primary={data.name} secondary={
													<Typography>Qty: {data.quantity.toString()}</Typography>
												} />
											</ListItem>
										)
									})}
								</List>
							</Paper>
							<Box paddingY={2}>
								<Typography variant="h3" gutterBottom>Shipping Information</Typography>
								<Typography variant="body1" >{order?.shipping?.format(["postal_code", "line1", "line2", "city", "state"])}</Typography>
							</Box>
						</Box>
						<ActivityView order={order} />
						<CommentView order={order} />
					</Box>
				</article>
			</Box>
		</Paper >
	)
}

const ActivityView = ({ order }: { order: Order }) => {
	const [activies] = useDataSourceListen<Activity>(Activity, {
		path: order.activities.collectionReference.path,
		orderBy: OrderBy("createdAt")
	})
	return (
		<Box>
			{activies.map((activity, index) => {
				if (activity.comment) return <UserComment key={index} activity={activity} />
				if (activity.changeDeliveryStatus) return <ActivityLog key={index} activity={activity} />
				return <ActivityLog key={index} activity={activity} />
			})}
		</Box>
	)
}

const ActivityLog = ({ activity }: { activity: Activity }) => {
	const theme = useTheme();
	const time = Dayjs(activity.createdAt.toDate()).fromNow()
	const [user, isLoading] = useDocumentListen<Social.User>(Social.User, Social.User.collectionReference().doc(activity.authoredBy))
	return (
		<Box paddingY={2} paddingX={2} paddingLeft={7}>
			<Box display="flex" alignItems="center">
				<Avatar variant="circle" style={{
					width: theme.spacing(3),
					height: theme.spacing(3)
				}}>
					<ImageIcon />
				</Avatar>
				<Box display="flex" alignItems="center" paddingLeft={1}>
					<Typography>{user?.name || activity.authoredBy}</Typography>
					<Box paddingLeft={1} color="text.secondary">Changed delivery status on {time} - from
					<Label marginX={1} fontSize={10} color="green">{DeliveryStatusLabel[activity.changeDeliveryStatus!.beforeStatus]}</Label>
					to
					<Label marginX={1} fontSize={10} color="green">{DeliveryStatusLabel[activity.changeDeliveryStatus!.afterStatus]}</Label>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

const UserComment = ({ activity }: { activity: Activity }) => {
	const theme = useTheme();
	const time = Dayjs(activity.createdAt.toDate()).fromNow()
	const [user] = useDocumentListen<Social.User>(Social.User, Social.User.collectionReference().doc(activity.authoredBy))
	return (
		<Box display="flex" paddingY={1}>
			<Box>
				<Avatar variant="circle">
					<ImageIcon />
				</Avatar>
			</Box>
			<Box
				flexGrow={1}
				border={1}
				borderColor={theme.palette.grey[300]}
				borderRadius={8}
				marginLeft={2}
			>
				<Box display="flex"
					style={{
						background: theme.palette.grey[100]
					}}
				>
					<Box display="flex" padding={2} paddingY={1}>
						<Typography>{user?.name || activity.authoredBy}</Typography>
						<Box paddingX={1} color="text.secondary">commented on {time}</Box>
					</Box>
				</Box>
				<Box padding={2}>
					<Typography variant="body1" display="inline">{activity.comment?.text}</Typography>
				</Box>
			</Box>
		</Box>
	)
}

const CommentView = ({ order }: { order: Order }) => {
	const [auth] = useAuthUser()
	const theme = useTheme();
	const [user] = useDocumentListen<Social.User>(Social.User, auth ? Social.User.collectionReference().doc(auth!.uid) : undefined)
	const [textField, setValue] = useTextField()

	const onSubmit = async (event) => {
		event.preventDefault();
		if (!auth) return
		const comment = new Comment()
		comment.text = textField.value as string
		const activity = new Activity(order.activities.collectionReference.doc())
		activity.authoredBy = auth.uid
		activity.comment = comment
		try {
			await activity.save()
			setValue("")
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<form onSubmit={onSubmit}>
			<Box display="flex" paddingY={3}>
				<Box>
					<Avatar variant="circle">
						<ImageIcon />
					</Avatar>
				</Box>
				<Box
					flexGrow={1}
					border={1}
					borderColor={theme.palette.grey[300]}
					borderRadius={8}
					marginLeft={2}
				>
					<Box display="flex"
						style={{
							background: theme.palette.grey[100]
						}}
					>
						<Box display="flex" padding={2} paddingY={1}>
							<Typography>{user?.name || "YOU"}</Typography>
						</Box>
					</Box>
					<Box
						padding={1}
					>
						<TextField
							{...textField}
							fullWidth multiline
							size="small"
							variant="outlined"
							placeholder="comment"
							rows={4}
						/>
						<Box
							display="flex"
							justifyContent="flex-end"
							paddingTop={2}
						>
							<Button
								type="submit"
								disabled={((textField.value as string)?.length == 0)}
								size="small"
								color="primary"
								variant="contained"
								disableElevation
							>Comment</Button>
						</Box>
					</Box>
				</Box>
			</Box>
		</form>
	)
}


const ActionSheet = ({ onNext, onClose }: { onNext: () => void, onClose: () => void }) => {
	return (
		<Paper>
			<Box>
				<Box fontSize={16} fontWeight={600} padding={2} paddingBottom={0}>
					Complete the delivery process.
				</Box>
				<Box fontSize={16} fontWeight={300} paddingX={2} paddingBottom={2} color="text.secondary">
					The payment is executed by completing the delivery process.
				</Box>
				<List component="nav">
					<ListItem button onClick={async () => {
						onNext()
					}}>
						<ListItemText primary="OK" />
					</ListItem>
				</List>
				<Divider />
				<List component="nav">
					<ListItem button onClick={onClose}>
						<ListItemText primary="Cancel" />
					</ListItem>
				</List>
			</Box>
		</Paper>
	)
}
