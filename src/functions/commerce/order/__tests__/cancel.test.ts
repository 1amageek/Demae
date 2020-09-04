
import * as admin from "firebase-admin"
import * as myFunctions from "../"
import Cart, { CartGroup, CartItem } from "../../../models/commerce/Cart"
import Order, { OrderItem } from "../../../models/commerce/Order"
import { init, setupProvider, setupCustomer, setupCart, projectId, setupProduct, setupSKU, updateOrder } from "./setup"
import { SalesMethod } from "../../../models/commerce/Product"
import { StockType } from "../../../common/commerce/Types"

init()

const test = require('firebase-functions-test')({
	databaseURL: "localhost:8080",
	projectId: projectId,
}, "serviceAccount/key.json")

const order = (cartGroup: CartGroup, purchasedBy: string) => {

	const subtotal = (item: CartItem) => {
		if (item.discount) {
			if (item.discount.type === "rate") {
				return item.amount - Math.floor(item.amount * item.discount.rate!)
			} else {
				return Math.max(item.amount - item.discount.amount!, 0)
			}
		}
		return item.amount * item.quantity
	}

	const tax = (item: CartItem) => {
		return Math.floor(subtotal(item) * item.taxRate / 100)
	}

	const total = (items: CartItem[]) => {
		const _subtotal = items.reduce((prev, current) => {
			return subtotal(current) + prev
		}, 0)
		const _tax = items.reduce((prev, current) => {
			return tax(current) + prev
		}, 0)
		return _subtotal + _tax
	}

	const items = cartGroup.items.map(item => {
		const orderItem: OrderItem = new OrderItem()
		orderItem.mediatedBy = item.mediatedBy
		orderItem.images = item.images
		orderItem.name = item.name
		orderItem.productReference = item.productReference
		orderItem.skuReference = item.skuReference
		orderItem.productType = item.productType
		orderItem.quantity = item.quantity
		orderItem.currency = item.currency
		orderItem.price = item.amount
		orderItem.amount = subtotal(item)
		orderItem.discount = item.discount
		orderItem.taxRate = item.taxRate
		orderItem.category = item.category
		orderItem.description = item.description
		orderItem.metadata = item.metadata
		orderItem.status = "none"
		return orderItem
	})
	const order: Order = new Order()
	order.purchasedBy = purchasedBy
	order.providedBy = cartGroup.providedBy
	order.title = `${items.map(item => item.name).join(", ")}`
	order.shipping = cartGroup.shipping
	order.shippingDate = cartGroup.shippingDate
	order.estimatedArrivalDate = cartGroup.estimatedArrivalDate
	order.currency = cartGroup.currency
	order.amount = total(cartGroup.items)
	order.items = items
	order.salesMethod = cartGroup.salesMethod
	order.deliveryStatus = "none"
	order.paymentStatus = "none"
	order.isCanceled = false
	order.metadata = cartGroup.metadata
	return order.data({ convertDocumentReference: true })
}

const shipping = {
	name: "村本章憲",
	address: {
		line2: "",
		postal_code: "106-0032",
		line1: "六本木",
		state: " 東京都",
		city: "港区"
	},
	phone: "+819000003333"
}

describe("Order Create Test", () => {

	beforeAll(async () => {
		await setupCustomer()
		await setupProvider()
	})

	describe("Donwload Item", () => {

		const salesMethod: SalesMethod = "download"

		describe("Canceled by customer", () => {

			const stockType: StockType = "finite"

			it("Cannot be cancelled", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const response = await test.wrap(myFunctions.create)({
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				const { error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "customer" }, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})

		})

		describe("Canceled by provider", () => {

			const stockType: StockType = "finite"

			it("Cannot be cancelled", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const response = await test.wrap(myFunctions.create)({
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				const { error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
					auth: {
						uid: 'TEST_PROVIDER'
					}
				})
				expect(error).not.toBeNull()
			})

		})
	})

	describe("In-Store Item", () => {

		const salesMethod: SalesMethod = "instore"

		describe("Canceled by customer", () => {

			const stockType: StockType = "finite"

			it("Cannot be cancelled", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const response = await test.wrap(myFunctions.create)({
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				const { error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "customer" }, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})

		})

		describe("Canceled by provider", () => {

			const stockType: StockType = "finite"

			describe("Can cancel", () => {

				it("preparing_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

			})

			describe("Can not cancel", () => {

				it("out_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "out_for_delivery")
					const snapshot = await admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`).get()
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(error).not.toBeUndefined()
				})

			})

		})
	})

	describe("Pickup Item", () => {

		const salesMethod: SalesMethod = "pickup"

		describe("Canceled by customer", () => {

			const stockType: StockType = "finite"

			it("Cannot be cancelled", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const response = await test.wrap(myFunctions.create)({
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				const { error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "customer" }, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})

		})

		describe("Canceled by provider", () => {

			const stockType: StockType = "finite"

			describe("Can cancel", () => {

				it("preparing_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

			})

			describe("Can not cancel", () => {

				it("out_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "out_for_delivery")
					const snapshot = await admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`).get()
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(error).not.toBeUndefined()
				})

			})

		})
	})

	describe("Online", () => {

		const salesMethod: SalesMethod = "online"

		describe("Canceled by customer", () => {

			const stockType: StockType = "finite"

			describe("Can cancel", () => {

				it("preparing_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

				it("out_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "out_for_delivery")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

				it("pending", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "pending")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})
			})

			describe("Cannot be cancelled", () => {

				it("in_transit", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "in_transit")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(error).not.toBeUndefined()
				})
			})

		})

		describe("Canceled by provider", () => {

			const stockType: StockType = "finite"

			describe("Can cancel", () => {

				it("preparing_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

				it("out_for_delivery", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "out_for_delivery")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})

				it("pending", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "pending")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(result.data.amount).toEqual(1080)
					expect(result.data.paymentStatus).toEqual("canceled")
					expect(result.data.deliveryStatus).toEqual("none")
					expect(result.data.isCanceled).toEqual(true)
					expect(result.data.paymentCancelResult).not.toBeNull()
					expect(error).toBeUndefined()
				})
			})

			describe("Cannot be cancelled", () => {

				it("in_transit", async () => {
					const product = await setupProduct(salesMethod)
					const sku = await setupSKU(product, {
						type: stockType,
						quantity: 1
					})
					await setupCart(salesMethod, product, sku, shipping)
					const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
					const cartGroup = cart.groups[0]
					const orderData = order(cartGroup, "TEST_CUSTOMER")
					const response = await test.wrap(myFunctions.create)({
						order: orderData,
						groupID: `TEST_PROVIDER-${salesMethod}`,
						paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
					}, {
						auth: {
							uid: 'TEST_CUSTOMER'
						}
					})
					await updateOrder([
						admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/orders/${response.result.id}`),
						admin.firestore().doc(`/commerce/v1/users/TEST_CUSTOMER/orders/${response.result.id}`),
					], "in_transit")
					const { result, error } = await test.wrap(myFunctions.cancel)({ orderID: response.result.id, canceledBy: "provider" }, {
						auth: {
							uid: 'TEST_PROVIDER'
						}
					})
					expect(error).not.toBeUndefined()
				})
			})


		})
	})

})
