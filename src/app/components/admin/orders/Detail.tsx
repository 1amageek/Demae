
import React, { useState } from "react"
import firebase from "firebase"
import { DeliveryStatus } from "common/commerce/Types"
import { Typography, Box, Paper, FormControl, Button, Grid, List, ListItem, ListItemText, ListItemAvatar, IconButton, Divider } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useAdminProviderOrder, } from "hooks/commerce";
import DataLoading from "components/DataLoading";
import { Menu, MenuItem } from '@material-ui/core';
import Select, { useSelect, useMenu } from "components/_Select"
import { useMenu as useMenuProp } from "components/Menu"
import Order from "models/commerce/Order"
import * as Social from "models/social"
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod, DeliveryStatusLabel, PaymentStatusLabel, DeliveryMethodLabel } from "hooks/commerce/DeliveryMethod"
import Dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Label from "components/Label";
import { useDocumentListen, useDataSourceListen, OrderBy } from "hooks/firestore";
import { useTheme } from "@material-ui/core/styles";
import TextField, { useTextField } from "components/TextField"
import InputView from "components/InputView"
import { Activity, Comment, ChangeDeliveryStatus, OrderCancel, OrderRefund } from "models/commerce/Order"
import { useContentToolbar, NavigationBackButton } from "components/NavigationContainer"
import { useAuthUser } from "hooks/auth";
import { Batch } from "@1amageek/ballcap";
import { useDrawer } from "components/Drawer";
import { useSnackbar } from "components/Snackbar";
import { useProcessing } from "components/Processing";
import { useModal } from 'components/Modal';
import ActionSheet from "components/ActionSheet"


Dayjs.extend(relativeTime)

export default ({ orderID }: { orderID?: string }) => {
	const theme = useTheme();
	const [auth] = useAuthUser()
	const [order, isLoading] = useAdminProviderOrder(orderID)
	const deliveryMethod = useDeliveryMethod()
	const deliveryMethodQuery = (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : "")

	const [showModal, closeModal] = useModal()
	const [showDrawer, closeDrawer] = useDrawer()
	const [showSnackbar] = useSnackbar()
	const [setProcessing] = useProcessing()

	const deliveryStatuses = deliveryStatusesForDeliveryMethod(order?.deliveryMethod) as any[]
	const deliveryStatusMenu = useMenu(deliveryStatuses)
	const [deliveryStatus, setStatus] = useSelect(order?.deliveryStatus)

	const [menuProps, handleOpen, handleClose] = useMenuProp()

	const onChageStatus = async (e) => {
		e.preventDefault()
		if (!auth) return
		const status = String(e.target.value) as DeliveryStatus
		if (status === "in_transit") {
			showDrawer(
				<ActionSheet
					title="Complete the delivery process."
					detail="The payment is executed by completing the delivery process."
					actions={
						[{
							title: "OK",
							handler: async (e) => {
								if (!order) return
								if (!order.paymentResult) return
								setProcessing(true)
								const paymentIntentID = order.paymentResult.id
								const orderID = order.id
								const capture = firebase.functions().httpsCallable("commerce-v1-order-capture")
								try {
									const response = await capture({ paymentIntentID, orderID })
									const { error, result } = response.data
									if (error) {
										showSnackbar("error", error.message)
										console.error(error)
									} else {
										const changeDeliveryStatus = new ChangeDeliveryStatus()
										changeDeliveryStatus.beforeStatus = deliveryStatus.value as DeliveryStatus
										changeDeliveryStatus.afterStatus = status as DeliveryStatus

										const activity = new Activity(order.activities.collectionReference.doc())
										activity.authoredBy = auth.uid
										activity.changeDeliveryStatus = changeDeliveryStatus
										setStatus(status)
										showSnackbar("success", "The product has been shipped.")
										console.log(result)
										activity.save()
									}
									setProcessing(false)
									closeDrawer()
								} catch (error) {
									console.error(error)
									setProcessing(false)
									closeDrawer()
								}
							}
						}]
					} />)
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

	useContentToolbar(() => {
		return (
			<Box display="flex" flexGrow={1} justifyContent="space-between" paddingX={1}>
				<Box>
					<NavigationBackButton title="Orders" href={`/admin/orders?deliveryMethod=${deliveryMethod}`} />
				</Box>
			</Box>
		)
	})

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
					<Box paddingBottom={1}>
						<Box display="flex">
							<Box flexGrow={1}>
								<Typography variant="h2">{order.title}</Typography>
								<Box color="text.secondary">
									<Typography variant="caption">
										{`ID: ${order.id}`} - {orderedDate.format("YYYY-MM-DD HH:mm:ss")}
									</Typography>
								</Box>
							</Box>
							<Box display="flex" alignItems="center">
								<Box paddingX={2}>
									<FormControl variant="outlined" size="small">
										<Select disabled={deliveryStatus.value === "none" || order.isCanceled} {...deliveryStatus} onChange={onChageStatus}>
											{deliveryStatusMenu}
										</Select>
									</FormControl>
								</Box>
								<Box>
									<IconButton onClick={handleOpen}>
										<MoreVertIcon />
									</IconButton>
									<Menu {...menuProps}>
										<MenuItem disabled={order.paymentStatus === "succeeded" || order.isCanceled} onClick={() => {
											handleClose()
											showDrawer(
												<ActionSheet
													title="Order Cancel"
													detail="Would you like to cancel your order?"
													actions={
														[{
															title: "OK",
															handler: async (e) => {
																closeDrawer()
																if (!auth) return
																if (!order) return

																showModal(
																	<InputView title="Comment" callback={async (text) => {
																		setProcessing(true)
																		const paymentIntentID = order.paymentResult.id
																		const orderID = order.id
																		const cancel = firebase.functions().httpsCallable("commerce-v1-order-cancel")
																		try {
																			const response = await cancel({ paymentIntentID, orderID })
																			const { error, result } = response.data
																			if (error) {
																				showSnackbar("error", error.message)
																				console.error(error)
																			} else {
																				const orderCancel = new OrderCancel()
																				orderCancel.comment = text
																				const activity = new Activity(order.activities.collectionReference.doc())
																				activity.authoredBy = auth.uid
																				activity.orderCancel = orderCancel
																				showSnackbar("success", "The product has been shipped.")
																				console.log(result)
																				activity.save()
																			}
																			setProcessing(false)
																			closeModal()
																		} catch (error) {
																			console.error(error)
																			showSnackbar("error", "The product has been shipped.")
																			setProcessing(false)
																			closeModal()
																		}
																	}} />
																)
															}
														}]
													} />)
										}}>Order Cancel</MenuItem>
										<MenuItem disabled={order.paymentStatus !== "succeeded" || order.isCanceled} onClick={() => {
											handleClose()
											showDrawer(
												<ActionSheet
													title="Refund"
													detail="Would you like to refund your order?"
													actions={
														[{
															title: "OK",
															handler: async (e) => {
																closeDrawer()
																if (!auth) return
																if (!order) return

																showModal(
																	<InputView title="Comment" callback={async (text) => {
																		setProcessing(true)
																		const orderID = order.id
																		const refund = firebase.functions().httpsCallable("commerce-v1-order-refund")
																		try {
																			const response = await refund({ orderID })
																			const { error, result } = response.data
																			if (error) {
																				showSnackbar("error", error.message)
																				console.error(error)
																			} else {
																				const orderRefund = new OrderRefund()
																				orderRefund.comment = text
																				const activity = new Activity(order.activities.collectionReference.doc())
																				activity.authoredBy = auth.uid
																				activity.orderRefund = orderRefund
																				showSnackbar("success", "The product has been shipped.")
																				console.log(result)
																				activity.save()
																			}
																			setProcessing(false)
																			closeModal()
																		} catch (error) {
																			console.error(error)
																			showSnackbar("error", "The product has been shipped.")
																			setProcessing(false)
																			closeModal()
																		}
																	}} />
																)
															}
														}]
													} />)
										}}>Payment Refund</MenuItem>
									</Menu>
								</Box>
							</Box>
						</Box>
						<Box display="flex" paddingY={1}>
							<Grid container>
								<Grid item xs={12} md={4}>
									<Typography variant="subtitle1">
										Delivery Status<Label marginX={1} color="gray" fontSize={11}>{DeliveryStatusLabel[order.deliveryStatus]}</Label>
									</Typography>
								</Grid>
								<Grid item xs={12} md={4}>
									<Typography variant="subtitle1">
										Delivery Method <Label marginX={1} color="gray" fontSize={11}>{DeliveryMethodLabel[order.deliveryMethod]}</Label>
									</Typography>
								</Grid>
								<Grid item xs={12} md={4}>
									<Typography variant="subtitle1">
										Payment Status <Label marginX={1} color="gray" fontSize={11}>{PaymentStatusLabel[order.paymentStatus]}</Label>
									</Typography>
								</Grid>
							</Grid>
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
													<Avatar variant="rounded" src={image} style={{
														height: theme.spacing(5),
														width: theme.spacing(5)
													}}>
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
				if (activity.orderCancel) return <CancelComment key={index} activity={activity} />
				if (activity.orderRefund) return <RefundComment key={index} activity={activity} />
				return <ActivityLog key={index} activity={activity} />
			})}
		</Box>
	)
}

const ActivityLog = ({ activity }: { activity: Activity }) => {
	const theme = useTheme();
	const time = Dayjs(activity.createdAt.toDate()).fromNow()
	const [user] = useDocumentListen<Social.User>(Social.User, Social.User.collectionReference().doc(activity.authoredBy))
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
					<Box maxWidth={theme.spacing(18)}>
						<Typography noWrap>{user?.name || activity.authoredBy}</Typography>
					</Box>
					{
						activity.changeDeliveryStatus &&
						<Box paddingLeft={1} color="text.secondary">
							Changed delivery status on {time} - from
						<Label marginX={1} fontSize={10} color="green">{DeliveryStatusLabel[activity.changeDeliveryStatus!.beforeStatus]}</Label>
						to
						<Label marginX={1} fontSize={10} color="green">{DeliveryStatusLabel[activity.changeDeliveryStatus!.afterStatus]}</Label>
						</Box>
					}
					{
						activity.changePaymentStatus &&
						<Box paddingLeft={1} color="text.secondary">
							Changed payment status on {time} - from
						<Label marginX={1} fontSize={10} color="green">{PaymentStatusLabel[activity.changePaymentStatus!.beforeStatus]}</Label>
						to
						<Label marginX={1} fontSize={10} color="green">{PaymentStatusLabel[activity.changePaymentStatus!.afterStatus]}</Label>
						</Box>
					}
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

const CancelComment = ({ activity }: { activity: Activity }) => {
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
				borderColor={theme.palette.error.main}
				borderRadius={8}
				marginLeft={2}
			>
				<Box display="flex"
					style={{
						background: theme.palette.error.light
					}}
				>
					<Box display="flex" padding={2} paddingY={1}>
						<Typography>{user?.name || activity.authoredBy}</Typography>
						<Box paddingX={1} color="text.secondary">canceled on {time}</Box>
					</Box>
				</Box>
				<Box padding={2}>
					<Typography variant="body1" display="inline">{activity.orderCancel?.comment}</Typography>
				</Box>
			</Box>
		</Box>
	)
}

const RefundComment = ({ activity }: { activity: Activity }) => {
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
				borderColor={theme.palette.error.main}
				borderRadius={8}
				marginLeft={2}
			>
				<Box display="flex"
					style={{
						background: theme.palette.error.light
					}}
				>
					<Box display="flex" padding={2} paddingY={1}>
						<Typography>{user?.name || activity.authoredBy}</Typography>
						<Box paddingX={1} color="text.secondary">refunded on {time}</Box>
					</Box>
				</Box>
				<Box padding={2}>
					<Typography variant="body1" display="inline">{activity.orderRefund?.comment}</Typography>
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
