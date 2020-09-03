
import * as admin from "firebase-admin"
import * as myFunctions from "../create"
import Cart, { CartGroup, CartItem } from "../../../models/commerce/Cart"
import Order, { OrderItem } from "../../../models/commerce/Order"
import { init, setupProvider, setupCustomer, setupCart, projectId, setupProduct, setupSKU } from "./setup"
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

		describe("StockType finite", () => {

			const stockType: StockType = "finite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct("download")
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 0
				})
				await setupCart("download", product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType bucket", () => {

			const stockType: StockType = "bucket"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "in_stock"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite limited", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "limited"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct("download")
				const sku = await setupSKU(product, {
					type: stockType,
					value: "out_of_stock"
				})
				await setupCart("download", product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType infinite", () => {

			const stockType: StockType = "infinite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})
		})

	})

	describe("In-Store Item", () => {

		const salesMethod: SalesMethod = "instore"

		describe("StockType finite", () => {

			const stockType: StockType = "finite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: "finite",
					quantity: 0
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType bucket", () => {

			const stockType: StockType = "bucket"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "in_stock"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite limited", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "limited"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct("download")
				const sku = await setupSKU(product, {
					type: stockType,
					value: "out_of_stock"
				})
				await setupCart("download", product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType infinite", () => {

			const stockType: StockType = "infinite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})
		})

	})

	describe("Pickup Item", () => {

		const salesMethod: SalesMethod = "pickup"

		describe("StockType finite", () => {

			const stockType: StockType = "finite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 0
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})

			it("Shpping undefined", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 0
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType bucket", () => {

			const stockType: StockType = "bucket"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "in_stock"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite limited", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "limited"
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct("download")
				const sku = await setupSKU(product, {
					type: stockType,
					value: "out_of_stock"
				})
				await setupCart("download", product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType infinite", () => {

			const stockType: StockType = "infinite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})
		})

	})

	describe("Online Item", () => {

		const salesMethod: SalesMethod = "online"

		describe("StockType finite", () => {

			const stockType: StockType = "finite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 1
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 0
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})

			it("Shpping undefined", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					quantity: 0
				})
				await setupCart(salesMethod, product, sku)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType bucket", () => {

			const stockType: StockType = "bucket"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "in_stock"
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite limited", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType,
					value: "limited"
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})

			it("Finite out of stock", async () => {
				const product = await setupProduct("download")
				const sku = await setupSKU(product, {
					type: stockType,
					value: "out_of_stock"
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { error } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(error).not.toBeNull()
			})
		})

		describe("StockType infinite", () => {

			const stockType: StockType = "infinite"

			it("Finite in stock", async () => {
				const product = await setupProduct(salesMethod)
				const sku = await setupSKU(product, {
					type: stockType
				})
				await setupCart(salesMethod, product, sku, shipping)
				const cart = await new Cart(admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")).fetch()
				const cartGroup = cart.groups[0]
				const orderData = order(cartGroup, "TEST_CUSTOMER")
				const wrapped = test.wrap(myFunctions.create)
				const data = {
					order: orderData,
					groupID: `TEST_PROVIDER-${salesMethod}`,
					paymentMethodID: "pm_1HMpAbEEPdlvsyGJH8woCUfg"
				}
				const { result } = await wrapped(data, {
					auth: {
						uid: 'TEST_CUSTOMER'
					}
				})
				expect(result.amount).toEqual(1080)
				expect(result.paymentResult.amount).toEqual(1080)
			})
		})

	})

})
