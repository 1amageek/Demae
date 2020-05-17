import React from 'react';
import { Button, Box, Grid, Avatar, Paper } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import { Provider, Product, SKU, Cart } from 'models/commerce';
import DataLoading from 'components/DataLoading';
import NotFound from 'components/NotFound'
import Login from 'components/Login'
import AddBoxIcon from '@material-ui/icons/AddBox';
import PaymentIcon from '@material-ui/icons/Payment';
import { useDocumentListen } from 'hooks/firestore';
import { useCart, useUser } from 'hooks/commerce'
import { useDialog } from 'components/Dialog'
import { useModal } from 'components/Modal';
import { useDrawer } from 'components/Drawer';
import QuickCheckout from 'components/quickCheckout'

export default ({ providerID, productID, skuID }: { providerID: string, productID: string, skuID: string }) => {

	const [user] = useUser()
	const [cart] = useCart()
	const [setDialog] = useDialog()
	const [setModal, modalClose] = useModal()
	const [showDrawer] = useDrawer()


	const provider: Provider = new Provider(providerID)
	const [product, isProductLoading] = useDocumentListen<Product>(Product, provider.products.collectionReference.doc(productID))
	const [sku, isLoading] = useDocumentListen<SKU>(SKU, provider.products.doc(productID, Product).skus.collectionReference.doc(skuID))
	const imageURL = (sku?.imageURLs() || []).length > 0 ? sku?.imageURLs()[0] : undefined

	const amount = sku?.price || 0
	const price = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: sku?.currency || 'USD' }).format(amount)

	const withLogin = async (sku: SKU, onNext: (sku: SKU) => void) => {
		if (user) {
			onNext(sku)
		} else {
			setDialog('Please Login', undefined, [
				{
					title: 'Cancel',
				},
				{
					title: 'OK',
					variant: 'contained',
					color: 'primary',
					handler: () => {
						setModal(<Login onNext={async (user) => {
							onNext(sku)
							modalClose()
						}} />)
					}
				}
			])
		}
	}

	const addSKU = async (sku: SKU) => {
		withLogin(sku, async (sku) => {
			if (!product) return
			if (user) {
				if (cart) {
					cart.addSKU(product, sku)
					await cart.save()
				} else {
					const cart = new Cart(user.id)
					cart.addSKU(product, sku)
					await cart.save()
				}
			}
		})
	}

	if (isLoading || isProductLoading) {
		return <DataLoading />
	}
	if (!sku || !product) {
		return <NotFound />
	}
	return (
		<>
			<Box
				width="100%"
				height="100%"
			>
				<Avatar variant="square" src={imageURL} alt={sku.name} style={{
					minHeight: "200px",
					height: '100%',
					width: '100%'
				}}>
					<ImageIcon />
				</Avatar>
			</Box>
			<Box padding={2}>
				<Box>
					<Box fontSize={22} fontWeight={800} paddingY={1}>
						{sku.name}
					</Box>
					<Box fontSize={18} fontWeight={600}>
						{sku.caption}
					</Box>
					<Box fontSize={18} fontWeight={600} color="text.secondary">
						{price}
					</Box>
					<Box>
						{sku.description}
					</Box>
				</Box>
			</Box>
			<Box
				zIndex={1050}
				position='fixed'
				bottom={58}
				width='100%'
				padding={1}
			>
				<Paper elevation={3}>
					<Box padding={1}>
						<Grid container spacing={1}>
							<Grid item xs={5}>
								<Button fullWidth size='large'
									startIcon={
										<AddBoxIcon />
									}
									onClick={(e) => {
										e.preventDefault()
										addSKU(sku)
									}}>Add to cart</Button>
							</Grid>
							<Grid item xs={7}>
								<Button fullWidth variant='contained' color='primary' size='large'
									startIcon={
										<PaymentIcon />
									}
									onClick={(e) => {
										e.preventDefault()
										showDrawer(
											<QuickCheckout product={product} sku={sku} />
										)
									}}>Purchase now</Button>
							</Grid>
						</Grid>
					</Box>
				</Paper>
			</Box>
		</>
	)
}
