
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
import Order from 'models/commerce/Order'
import { useDeliveryMethod, deliveryStatusesForDeliveryMethod, DeliveryStatusLabel, PaymentStatusLabel } from "./helper"
import Dayjs from "dayjs"
import Label from "components/Label";
import { useDocumentListen } from "hooks/firestore";
import { useTheme } from '@material-ui/core/styles';
import TextField, { useTextField } from 'components/TextField'

export default ({ orderID }: { orderID?: string }) => {
	const theme = useTheme();
	const [provider] = useAdminProvider()
	const [order, isLoading] = useAdminProviderOrder(orderID)
	const deliveryMethod = useDeliveryMethod()
	const deliveryMethodQuery = (deliveryMethod ? `?deliveryMethod=${deliveryMethod}` : "")

	const [showDrawer, onClose] = useDrawer()
	const [showSnackbar] = useSnackbar()

	const deliveryStatuses = deliveryStatusesForDeliveryMethod(order?.deliveryMethod) as any[]
	const deliveryStatusMenu = useMenu(deliveryStatuses)
	const [deliveryStatus, setStatus] = useSelect(order?.deliveryStatus)

	if (isLoading) {
		return (
			<Board link={"/admin/orders" + deliveryMethodQuery}>
				<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500} justifyContent="center" alignItems="center">
					<DataLoading />
				</Box>
			</Board>
		)
	}

	if (!order) {
		return (
			<Board link={"/admin/orders" + deliveryMethodQuery}>
			</Board>
		)
	}

	const orderedDate = Dayjs(order.createdAt.toDate())
	return (
		<Paper elevation={0}>
			<Box padding={2} style={{
				height: "100vh"
			}}>
				<article>
					<Box paddingBottom={1} display="flex">
						<Box flexGrow={1}>
							<Typography variant="h2">{order.title}</Typography>
							<Typography variant="caption">
								{`ID: ${order.id}`} - {orderedDate.format("YYYY-MM-DD HH:mm:ss")}
							</Typography>
							<Box display="flex" paddingY={1}>
								<Label color="gray" fontSize={12}>{DeliveryStatusLabel[order.deliveryStatus]}</Label>
								<Label color="gray" fontSize={12}>{PaymentStatusLabel[order.paymentStatus]}</Label>
							</Box>
						</Box>
						<Box>
							<FormControl variant="outlined" size="small">
								<Select disabled={deliveryStatus.value === "none"} {...deliveryStatus} onChange={async (e) => {
									e.preventDefault()
									const status = String(e.target.value) as DeliveryStatus
									if (status === "in_transit") {
										showDrawer(<ActionSheet onNext={async () => {
											setStatus(status)
											if (!order) return
											if (!order.paymentResult) return
											const paymentIntentID = order.paymentResult.id
											const capture = firebase.functions().httpsCallable("commerce-v1-checkout-capture")
											const response = await capture({ paymentIntentID })
											const { error, result } = response.data
											if (error) {
												showSnackbar("error", error.message)
												console.error(error)
											} else {
												showSnackbar("success", "The product has been shipped.")
												console.log(result)
											}
											onClose()
										}} onClose={onClose} />)
									} else {
										setStatus(status)
										if (!order) return
										order.deliveryStatus = status
										await order.save()
										showSnackbar("success", "Change status.")
									}
								}}>
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
								<Typography>{order?.shipping?.format(["postal_code", "line1", "line2", "city", "state"])}</Typography>
							</Box>
						</Box>
						<Comment order={order} />
					</Box>
				</article>
			</Box>
		</Paper >
	)
}

const Activity = ({ order }: { order: Order }) => {
	const theme = useTheme();
	return (
		<Box display="flex">
			<Box>
				<Avatar variant="rounded">
					<ImageIcon />
				</Avatar>
			</Box>
			<Box
				border={1}
				borderColor={theme.palette.grey[300]}
				borderRadius={8}
				padding={2}
			>
				aa
			</Box>
		</Box>
	)
}

const Comment = ({ order }: { order: Order }) => {
	const theme = useTheme();
	const [textField] = useTextField()
	return (
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
				padding={2}
				marginLeft={2}
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
					paddingTop={1}
				>
					<Button
						size="small"
						color="primary"
						variant="contained"
						disableElevation
					>Comment</Button>
				</Box>

			</Box>
		</Box>
	)
}


const ActionSheet = ({ onNext, onClose }: { onNext: () => void, onClose: () => void }) => {
	return (
		<Paper>
			<Box>
				<Box fontSize={16} fontWeight={600} padding={2} paddingBottom={0}>
					Complete the delivery process.
				</Box>
				<Box fontSize={16} fontWeight={400} paddingX={2} paddingBottom={2} color="text.secondary">
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
