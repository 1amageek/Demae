
import React, { useEffect } from "react"
import firebase from "firebase"
import { Box, Paper, TableContainer, Table, TableBody, TableCell, TableRow, Avatar, Tooltip, IconButton, Slide, Button } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import DataLoading from "components/DataLoading";
import CardBrand from "common/stripe/CardBrand"
import User from "models/commerce/User"
import CartItemCell from "./CartItemCell"
import CardList from "./payment"
import ShippingAddressList from "./shipping"
import Summary from "components/cart/summary"
import Navigation, { usePush } from "components/Navigation"
import { useProcessing } from "components/Processing";
import { useSnackbar } from "components/Snackbar"
import { useAuthUser } from "hooks/auth"
import { useUser, useCart, } from "hooks/commerce";

export default ({ groupID, onClose, onComplete }: { groupID: string, onClose: () => void, onComplete: () => void }) => {
	return (
		<Navigation>
			<Checkout groupID={groupID} onClose={onClose} onComplete={onComplete} />
		</Navigation>
	)
}

const Checkout = ({ groupID, onClose, onComplete }: { groupID: string, onClose: () => void, onComplete: () => void }) => {

	const [auth] = useAuthUser()
	const [user, isUserLoading] = useUser()
	const [cart, isCartLoading] = useCart()

	const cartGroup = cart?.cartGroup(groupID)
	const defaultShipping = user?.defaultShipping
	const defaultCard = user?.defaultCard

	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()
	const [push] = usePush()

	const shouldBeEnable = () => {
		if (isUserLoading) return false
		if (!cartGroup) return false
		if (cartGroup.deliveryMethod === "shipping") {
			return !!(defaultShipping) && !!(defaultCard)
		}
		return !!(defaultCard)
	}

	const isAvailable: boolean = shouldBeEnable()

	const withCustomer = async (auth: firebase.User, user: User): Promise<{ error?: any, customerID?: any }> => {
		if (user.stripe?.customerID) {
			return { customerID: user.stripe.customerID }
		} else {
			const create = firebase.functions().httpsCallable("stripe-v1-customer-create")
			const response = await create({
				phone: auth.phoneNumber,
				metadata: {
					uid: auth.uid
				}
			})
			const { error, result } = response.data
			if (error) {
				return { error }
			} else {
				const customer = result
				await user.documentReference.set({
					stripe: {
						customerID: customer.id,
						link: `https://dashboard.stripe.com${
							customer.livemode ? "" : "/test"
							}/customers/${customer.id}`
					}
				}, { merge: true })
				return { customerID: customer.id }
			}
		}
	}

	const checkout = async () => {
		if (!auth) return
		if (!user) return
		if (!cartGroup) return

		const { error, customerID } = await withCustomer(auth, user)

		if (error) {
			console.error(error)
			return
		}

		if (!customerID) {
			console.log("[CHECKOUT] customerID is not exist")
			return
		}
		// paymentMethodID
		const paymentMethodID = user.defaultCard?.id
		if (!paymentMethodID) {
			console.log("[CHECKOUT] paymentMethodID is not exist")
			return
		}

		if (cartGroup.deliveryMethod === "shipping") {
			// defaultShipping
			const defaultShipping = user.defaultShipping
			if (!defaultShipping) {
				console.log("[CHECKOUT] defaultShipping is not exist")
				return
			}

			cartGroup.shipping = defaultShipping
		}

		// create order
		const data = cartGroup.order(user.id)

		try {
			setProcessing(true)
			const checkoutCreate = firebase.functions().httpsCallable("commerce-v1-order-create")
			const response = await checkoutCreate({
				order: data,
				groupID: groupID,
				paymentMethodID: paymentMethodID,
				customerID: customerID
			})
			const { error, result } = response.data
			if (error) {
				console.error(error)
				setMessage("error", error.message)
				setProcessing(false)
				return
			}
			console.log(result)
			setMessage("success", "Success")
			onComplete()
		} catch (error) {
			console.log(error)
			setMessage("error", "Error")
		}
		setProcessing(false)
	}

	if (isUserLoading || isCartLoading) {
		return <DataLoading />
	}

	if (!cartGroup) {
		return <Empty onClose={onClose} />
	}

	const subtotal = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartGroup.currency }).format(cartGroup.tax())
	const total = new Intl.NumberFormat("ja-JP", { style: "currency", currency: cartGroup.currency }).format(cartGroup.total())

	return (
		<Paper style={{ width: "100%" }}>
			<TableContainer>
				<Table>
					<TableBody>
						<TableRow onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							push(
								<CardList user={user!} />
							)
						}}>
							<TableCell style={{ width: "90px" }}>
								<Box color="text.secondary" fontWeight={700} flexGrow={1}>CARD</Box>
							</TableCell>
							<TableCell>
								{defaultCard &&
									<Box display="flex" alignItems="center" flexGrow={1} style={{ width: "180px" }}>
										<Box display="flex" alignItems="center" flexGrow={1} fontSize={22}>
											<i className={`pf ${CardBrand[defaultCard!.brand]}`}></i>
										</Box>
										<Box justifySelf="flex-end" fontSize={16} fontWeight={500}>
											{`• • • •  ${defaultCard?.last4}`}
										</Box>
									</Box>
								}
							</TableCell>
							<TableCell>
								<Box display="flex" flexGrow={1} justifyContent="flex-end" alignItems="center">{defaultCard ? <NavigateNextIcon /> : <ErrorIcon color="secondary" />}</Box>
							</TableCell>
						</TableRow>
						{cartGroup.deliveryMethod === "shipping" &&
							<TableRow onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								push(
									<ShippingAddressList user={user!} />
								)
							}}>
								<TableCell style={{ width: "90px" }}>
									<Box color="text.secondary" fontWeight={700} flexGrow={1}>SHIPPING</Box>
								</TableCell>
								<TableCell>
									{defaultShipping?.name && <Box>{defaultShipping?.name}</Box>}
									{defaultShipping?.address?.state && <Box>{defaultShipping?.address?.state}</Box>}
									{defaultShipping?.address?.city && <Box>{defaultShipping?.address?.city}</Box>}
									{defaultShipping?.address?.line1 && <Box>{`${defaultShipping?.address?.line1}${defaultShipping?.address?.line2}`}</Box>}
								</TableCell>
								<TableCell align="left">
									<Box display="flex" flexGrow={1} justifyContent="flex-end" alignItems="center">{defaultShipping ? <NavigateNextIcon /> : <ErrorIcon color="secondary" />}</Box>
								</TableCell>
							</TableRow>
						}
					</TableBody>
				</Table>
			</TableContainer>
			<Box padding={2}>
				<Box>
					{cartGroup.items.map(cartItem => {
						return <CartItemCell key={cartItem.skuReference!.path} groupID={cartGroup.groupID} cartItem={cartItem} />
					})}
				</Box>
				<Summary
					disabled={!isAvailable}
					onClick={(e) => {
						e.preventDefault()
						checkout()
					}}
					items={[
						{
							type: "subtotal",
							title: "Subtotal",
							detail: `${subtotal}`
						},
						{
							type: "tax",
							title: "Tax",
							detail: `${tax}`
						},
						{
							type: "total",
							title: "Total",
							detail: `${total}`
						}
					]} />
			</Box>
		</Paper>
	)
}

const Empty = ({ onClose }: { onClose: () => void }) => {

	useEffect(onClose, [])

	return (
		<Box display="flex" fontSize={18} fontWeight={500} padding={3} justifyContent="center">
			The items are empty.
		</Box>
	)
}
