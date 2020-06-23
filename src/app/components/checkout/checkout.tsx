
import React, { useEffect } from 'react'
import firebase from 'firebase'
import { Box, Paper, TableContainer, Table, TableBody, TableCell, TableRow, Avatar, Tooltip, IconButton, Slide, Button } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import DataLoading from 'components/DataLoading';
import CardBrand from 'common/stripe/CardBrand'
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar'
import Navigation, { usePush } from 'components/Navigation'
import { useUser, useCart } from 'hooks/commerce';
import CartItemCell from './CartItemCell'
import CardList from './payment/list'
import ShippingAddressList from './shipping/list'
import Summary from 'components/cart/summary'

export default ({ groupID, onClose, onComplete }: { groupID: string, onClose: () => void, onComplete: () => void }) => {
	return (
		<Navigation>
			<Checkout groupID={groupID} onClose={onClose} onComplete={onComplete} />
		</Navigation>
	)
}

const Checkout = ({ groupID, onClose, onComplete }: { groupID: string, onClose: () => void, onComplete: () => void }) => {

	const [user, isUserLoading] = useUser()
	const [cart, isCartLoading] = useCart()

	const cartGroup = cart?.cartGroup(groupID)
	const defaultShipping = user?.defaultShipping
	const defaultCart = user?.defaultCard

	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()
	const [push] = usePush()

	const checkout = async () => {
		if (!user) return
		if (!cartGroup) return
		// customerID
		const customerID = user.customerID
		if (!customerID) return

		// paymentMethodID
		const paymentMethodID = user.defaultCard?.id
		if (!paymentMethodID) return

		if (cartGroup.deliveryMethod === 'shipping') {
			// defaultShipping
			const defaultShipping = user.defaultShipping
			if (!defaultShipping) return

			cartGroup.shipping = defaultShipping
		}

		// create order
		const data = cartGroup.order(user.id)

		try {
			setProcessing(true)
			const checkoutCreate = firebase.functions().httpsCallable('commerce-v1-checkout-create')
			const response = await checkoutCreate({
				order: data,
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

	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.tax())

	return (
		<Paper style={{ width: '100%' }}>
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
							<TableCell style={{ width: '90px' }}>
								<Box color='text.secondary' fontWeight={700} flexGrow={1}>CARD</Box>
							</TableCell>
							<TableCell>
								{defaultCart &&
									<Box display="flex" alignItems="center" flexGrow={1} style={{ width: '180px' }}>
										<Box display="flex" alignItems="center" flexGrow={1} fontSize={22}>
											<i className={`pf ${CardBrand[defaultCart!.brand]}`}></i>
										</Box>
										<Box justifySelf="flex-end" fontSize={16} fontWeight={500}>
											{`• • • •  ${defaultCart?.last4}`}
										</Box>
									</Box>
								}
							</TableCell>
							<TableCell>
								<Box display='flex' flexGrow={1} justifyContent="flex-end" alignItems='center'>{defaultCart ? <NavigateNextIcon /> : <ErrorIcon color="secondary" />}</Box>
							</TableCell>
						</TableRow>
						{cartGroup.deliveryMethod === 'shipping' &&
							<TableRow onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								push(
									<ShippingAddressList user={user!} />
								)
							}}>
								<TableCell style={{ width: '90px' }}>
									<Box color='text.secondary' fontWeight={700} flexGrow={1}>SHIPPING</Box>
								</TableCell>
								<TableCell>
									{defaultShipping?.name && <Box>{defaultShipping?.name}</Box>}
									{defaultShipping?.address?.state && <Box>{defaultShipping?.address?.state}</Box>}
									{defaultShipping?.address?.city && <Box>{defaultShipping?.address?.city}</Box>}
									{defaultShipping?.address?.line1 && <Box>{`${defaultShipping?.address?.line1}${defaultShipping?.address?.line2}`}</Box>}
								</TableCell>
								<TableCell align='left'>
									<Box display='flex' flexGrow={1} justifyContent="flex-end" alignItems='center'>{defaultShipping ? <NavigateNextIcon /> : <ErrorIcon color="secondary" />}</Box>
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
					disabled={isUserLoading}
					onClick={(e) => {
						e.preventDefault()
						checkout()
					}}
					items={[{
						type: 'subtotal',
						title: 'Subtotal',
						detail: `${subtotal}`
					}, {
						type: 'tax',
						title: 'Tax',
						detail: `${tax}`
					}]} />
			</Box>
		</Paper>
	)
}

const Empty = ({ onClose }: { onClose: () => void }) => {

	useEffect(onClose, [])

	return (
		<Box display='flex' fontSize={18} fontWeight={500} padding={3} justifyContent='center'>
			The items are empty.
		</Box>
	)
}
