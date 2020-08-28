import React from "react";
import { Button, Box, Grid, Avatar, Paper, Typography, Container } from "@material-ui/core";
import Markdown from "react-markdown"
import ImageIcon from "@material-ui/icons/Image";
import { Provider, Product, SKU, Cart } from "models/commerce";
import DataLoading from "components/DataLoading";
import NotFound from "components/NotFound"
import Login from "components/Login"
import AddBoxIcon from "@material-ui/icons/AddBox";
import PaymentIcon from "@material-ui/icons/Payment";
import { useImage } from "utils/ImageManager"
import { useDocumentListen } from "hooks/firestore";
import { useCart, useUser } from "hooks/commerce"
import { useDialog } from "components/Dialog"
import { useModal } from "components/Modal";
import { useDrawer } from "components/Drawer";
import { useHistory } from "react-router-dom";
import QuickCheckout from "components/checkout/checkout"
import ActionBar from "components/ActionBar"
import { useMediator } from "hooks/url"
import { CartGroup } from "models/commerce/Cart";

export default ({ providerID, productID, skuID }: { providerID: string, productID: string, skuID: string }) => {

	const history = useHistory()
	const mediatorID = useMediator()
	const [user] = useUser()
	const [cart] = useCart()
	const [showDialog] = useDialog()
	const [showModal, closeModal] = useModal()
	const [showDrawer, closeDrawer] = useDrawer()

	const provider: Provider = new Provider(providerID)
	const [product, isProductLoading] = useDocumentListen<Product>(Product, provider.products.collectionReference.doc(productID))
	const [sku, isLoading] = useDocumentListen<SKU>(SKU, provider.products.doc(productID, Product).skus.collectionReference.doc(skuID))
	const imageURL = (sku?.imagePaths() || []).length > 0 ? sku?.imagePaths()[0] : undefined
	const imgProps = useImage({ path: imageURL, alt: `${sku?.name ?? ""} ${sku?.caption ?? ""}` })

	const amount = sku?.price || 0
	const price = new Intl.NumberFormat("ja-JP", { style: "currency", currency: sku?.currency || "USD" }).format(amount)

	const withLogin = async (sku: SKU, onNext: (sku: SKU) => void) => {
		if (user) {
			onNext(sku)
		} else {
			showDialog("Please Login", undefined, [
				{
					title: "Cancel",
				},
				{
					title: "OK",
					variant: "contained",
					color: "primary",
					handler: () => {
						showModal(<Login onNext={async (user) => {
							onNext(sku)
							closeModal()
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
				const groupID = CartGroup.ID(product)
				if (cart) {
					const group = cart?.cartGroup(groupID) || CartGroup.fromSKU(product, sku)
					group.groupID = groupID
					group.addSKU(product, sku, mediatorID)
					cart?.setCartGroup(group)
					await cart.save()
				} else {
					const cart = new Cart(user.id)
					const group = cart.cartGroup(groupID) || CartGroup.fromSKU(product, sku)
					group.groupID = groupID
					group.addSKU(product, sku, mediatorID)
					cart?.setCartGroup(group)
					await cart.save()
				}
			}
		})
	}

	const onPurchaseNow = async (e) => {
		e.preventDefault()
		if (!product) throw new Error("Product not found")
		if (!sku) throw new Error("SKU not found")
		if (user) {
			const _cart = cart || new Cart(user.id)
			const group = cart?.cartGroup("quick") || CartGroup.fromSKU(product, sku)
			group.groupID = "quick"
			group.setSKU(product, sku, mediatorID)
			_cart?.setCartGroup(group)
			await _cart?.save()
			showDrawer(
				<QuickCheckout
					groupID={"quick"}
					onClose={closeDrawer}
					onComplete={() => {
						closeDrawer()
						history.push(`/checkout/${providerID}/completed`)
					}}
				/>
			)
		} else {
			showDialog("Welcome 🎉", "Please log in first to purchase this product.", [
				{
					title: "OK",
					handler: () => {
						showModal(<Login onNext={() => {
							closeModal()
						}} />)
					}
				}
			])
		}
	}

	const InstantActionButtonTitle = product?.salesMethod === "download" ? "DOWNLOAD" : "Purchase now"
	const InstantActionButtonWidth = (product?.salesMethod === "download" || product?.salesMethod === "instore") ? 12 : 7

	if (isLoading || isProductLoading) {
		return (
			<Container maxWidth="sm" disableGutters>
				<DataLoading />
			</Container>
		)
	}
	if (!sku || !product) {
		return (
			<Container maxWidth="sm" disableGutters>
				<NotFound />
			</Container>
		)
	}
	return (
		<article>
			<Container maxWidth="sm" disableGutters>
				<Box
					width="100%"
					height="100%"
				>
					<Box>
						<Avatar variant="square" {...imgProps} style={{
							minHeight: "300px",
							height: "100%",
							width: "100%"
						}}>
							<ImageIcon />
						</Avatar>
						<Box zIndex="mobileStepper"></Box>
					</Box>

				</Box>
				<Box paddingX={1}>
					<ActionBar />
				</Box>
				<Box padding={2} paddingBottom={6}>
					<Box>
						<Typography variant="h1" gutterBottom>{sku.name}</Typography>
						<Typography variant="subtitle1">{sku.caption}</Typography>
						<Box paddingY={1} fontSize={18} fontWeight={600} color="text.secondary">
							{price}
						</Box>
						<Markdown source={sku.description}></Markdown>
					</Box>
				</Box>
			</Container>

			<Box
				zIndex={1050}
				position="fixed"
				bottom={58}
				width="100%"
				padding={1}
				display="flex"
				justifyContent="center"
			>
				<Container maxWidth="sm" disableGutters>
					<Paper elevation={2}
						style={{
							backgroundColor: "rgba(255, 255, 255, 0.6)",
							backdropFilter: "blur(20px)",
							WebkitBackdropFilter: "blur(20px)"
						}}
					>
						<Box padding={1}>
							<Grid container spacing={1}>
								{(product.salesMethod === "pickup" || product.salesMethod === "online") &&
									<Grid item xs={5}>
										<Button fullWidth
											size="large"
											style={{ fontSize: "12px" }}
											startIcon={
												<AddBoxIcon />
											}
											onClick={(e) => {
												e.preventDefault()
												addSKU(sku)
											}}>Add to cart</Button>
									</Grid>
								}

								<Grid item xs={InstantActionButtonWidth}>
									<Button
										fullWidth
										disableElevation
										variant="contained"
										color="primary"
										size="large"
										style={{ fontSize: "12px" }}
										startIcon={
											<PaymentIcon />
										}
										onClick={onPurchaseNow}>{InstantActionButtonTitle}</Button>
								</Grid>
							</Grid>
						</Box>
					</Paper>
				</Container>
			</Box>
		</article>
	)
}
