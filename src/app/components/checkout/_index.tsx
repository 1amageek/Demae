
import React from 'react'
import firebase from 'firebase'
import { useHistory, Link } from 'react-router-dom'
import { Box, Paper, TableContainer, Table, TableBody, TableCell, TableRow, Avatar, Tooltip, IconButton, Slide, Button } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import DataLoading from 'components/DataLoading';
import CardBrand from 'common/stripe/CardBrand'
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar'
import Navigation, { usePush, usePop } from 'components/Navigation'
import { useUser, useCart } from 'hooks/commerce';
import CartItemCell from './CartItemCell'
import CardList from './payment/list'
import ShippingAddressList from './shipping/list'
import Summary from 'components/cart/summary'
import { CartGroup } from 'models/commerce/Cart';


export default ({ cartGroup }: { cartGroup: CartGroup }) => {
	// const { providerID } = props.match.params
	const history = useHistory()
	const [user, isUserLoading] = useUser()
	const [cart, isCartLoading] = useCart()
	const defaultShipping = user?.defaultShipping
	const defaultCart = user?.defaultCard

	const subtotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.subtotal())
	const tax = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cartGroup.currency }).format(cartGroup.tax())

	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()
	const [push] = usePush()

	const checkout = async () => {
		if (!user) { return }
		if (!cart) { return }

		// customerID
		const customerID = user.customerID
		if (!customerID) { return }

		// defaultShipping
		const defaultShipping = user.defaultShipping
		if (!defaultShipping) { return }

		// paymentMethodID
		const paymentMethodID = user.defaultCard?.id
		if (!paymentMethodID) { return }


		cartGroup.shipping = defaultShipping
		const data = cart.order(cartGroup)

		try {
			setProcessing(true)
			const checkoutCreate = firebase.functions().httpsCallable('v1-commerce-checkout-create')
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
			history.push(`/checkout/${cartGroup.providedBy}/completed`)
		} catch (error) {
			console.log(error)
			setMessage("error", "Error")
		}
		setProcessing(false)
	}


	if (isUserLoading) {
		return <DataLoading />
	}

	return (
		<Navigation>
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
		</Navigation>
	)
}
