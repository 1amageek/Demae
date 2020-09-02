import { initialize } from "@1amageek/ballcap-admin"
import * as admin from "firebase-admin"
import { SalesMethod } from "../../../models/commerce/Product"
import { Inventory } from "../../../common/commerce/Types"


const SKU_PRICE = 1000
const SKU_TAXRATE = 8

export const projectId = process.env.GCLOUD_PROJECT

export const init = () => {
	const adminApp = admin.initializeApp({
		projectId: projectId
	})
	initialize(adminApp)
	const db = adminApp.firestore()
	db.settings({
		host: "localhost:8080",
		ssl: false
	})
}

export const setupProvider = async () => {

	await admin.firestore().doc("/commerce/v1/providers/TEST_PROVIDER")
		.set(
			{
				"phone": "",
				"email": "",
				"url": null,
				"location": null,
				"country": "JP",
				"sns": null,
				"address": null,
				"caption": "",
				"createdAt": admin.firestore.FieldValue.serverTimestamp(),
				"name": "TEST PROVIDER",
				"updatedAt": admin.firestore.FieldValue.serverTimestamp(),
				"capabilities": [
					"download",
					"instore",
					"online",
					"pickup"
				],
				"description": "",
				"coverImage": null,
				"thumbnailImage": null,
				"metadata": {},
				"defaultCurrency": "JPY"
			}
		)

	await admin.firestore().doc("/account/v1/accounts/TEST_PROVIDER")
		.set(
			{
				"businessType": "individual",
				"balance": 0,
				"updatedAt": admin.firestore.FieldValue.serverTimestamp(),
				"isRejected": false,
				"hasLegalEntity": false,
				"isSigned": false,
				"commissionRate": 10,
				"country": "JP",
				"stripe": {
					"metadata": {
						"uid": "TEST_PROVIDER"
					},
					"tos_acceptance": {
						"ip": "150.249.195.43",
						"date": 1598956723,
						"user_agent": null
					},
					"individual": {
						"requirements": {
							"currently_due": [],
							"pending_verification": [],
							"past_due": [],
							"errors": [],
							"eventually_due": []
						},
						"email": "nori@stamp.team",
						"first_name": "章憲",
						"id": "person_HwPiBwcnAYeeiA",
						"object": "person",
						"metadata": {},
						"dob": {
							"month": 9,
							"year": 1987,
							"day": 18
						},
						"last_name_kana": "ムラモト",
						"first_name_kana": "ノリカズ",
						"account": "acct_1HMWsxEG3qKpgF6j",
						"address_kana": {
							"state": "トウキョウト",
							"city": "ミナトク",
							"line2": null,
							"line1": "13-35",
							"postal_code": "1060032",
							"country": "JP",
							"town": "ロッポンギ"
						},
						"last_name_kanji": "村本",
						"first_name_kanji": "章憲",
						"verification": {
							"details_code": null,
							"document": {
								"front": "file_1HMWsOEEPdlvsyGJWhrY3wD0",
								"back": "file_1HMWsQEEPdlvsyGJoL8zQBzy",
								"details": null,
								"details_code": null
							},
							"status": "pending",
							"additional_document": {
								"details_code": null,
								"back": null,
								"front": null,
								"details": null
							},
							"details": null
						},
						"last_name": "村本",
						"gender": "male",
						"created": 1598956723,
						"address_kanji": {
							"country": "JP",
							"town": "六本木",
							"state": "東京都",
							"line1": "１ー４ー５",
							"city": "港区",
							"postal_code": "1060032",
							"line2": null
						},
						"relationship": {
							"owner": false,
							"title": null,
							"representative": true,
							"director": false,
							"percent_ownership": null,
							"executive": false
						},
						"phone": "+819000000000"
					},
					"payouts_enabled": false,
					"object": "account",
					"default_currency": "jpy",
					"external_accounts": {
						"data": [],
						"object": "list",
						"total_count": 0,
						"has_more": false,
						"url": "/v1/accounts/acct_1HMWsxEG3qKpgF6j/external_accounts"
					},
					"business_type": "individual",
					"business_profile": {
						"support_email": null,
						"support_phone": null,
						"product_description": null,
						"mcc": null,
						"support_address": null,
						"support_url": null,
						"url": null,
						"name": null
					},
					"charges_enabled": true,
					"id": "acct_1HMWsxEG3qKpgF6j",
					"created": 1598956724,
					"company": {
						"tax_id_provided": false,
						"name": null,
						"phone": "+819028988690",
						"owners_provided": true,
						"executives_provided": true,
						"name_kanji": null,
						"directors_provided": true,
						"name_kana": null,
						"address_kanji": {
							"country": "JP",
							"town": "六本木",
							"state": "東京都",
							"line1": "1-4-5",
							"city": "港区",
							"postal_code": "１０６００３２",
							"line2": null
						},
						"verification": {
							"document": {
								"details": null,
								"front": null,
								"details_code": null,
								"back": null
							}
						},
						"address_kana": {
							"state": "トウキョウト",
							"city": "ミナトク",
							"line2": null,
							"line1": "13-35",
							"postal_code": "1060032",
							"country": "JP",
							"town": "ロッポンギ"
						}
					},
					"requirements": {
						"eventually_due": [
							"external_account"
						],
						"errors": [],
						"pending_verification": [],
						"past_due": [
							"external_account"
						],
						"currently_due": [
							"external_account"
						],
						"current_deadline": null,
						"disabled_reason": "requirements.past_due"
					},
					"country": "JP",
					"details_submitted": true,
					"capabilities": {
						"transfers": "active",
						"card_payments": "active"
					},
					"type": "custom",
					"email": null,
					"settings": {
						"branding": {
							"logo": null,
							"icon": null,
							"primary_color": null,
							"secondary_color": null
						},
						"payouts": {
							"statement_descriptor": null,
							"debit_negative_balances": false,
							"schedule": {
								"delay_days": 4,
								"interval": "weekly",
								"weekly_anchor": "friday"
							}
						},
						"dashboard": {
							"display_name": null,
							"timezone": "Etc/UTC"
						},
						"payments": {
							"statement_descriptor": "",
							"statement_descriptor_kanji": null,
							"statement_descriptor_kana": null
						},
						"card_payments": {
							"decline_on": {
								"cvc_failure": false,
								"avs_failure": false
							},
							"statement_descriptor_prefix": null
						},
						"bacs_debit_payments": {}
					}
				},
				"metadata": {},
				"createdAt": admin.firestore.FieldValue.serverTimestamp(),
				"defaultCurrency": "JPYP"
			}
		)
}

export const setupProduct = async (salesMethod: SalesMethod) => {
	const ref = admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/TEST_PRODUCT-${salesMethod}`)
	await ref
		.set(
			{
				"price": {
					"JPY": SKU_PRICE
				},
				"updatedAt": admin.firestore.FieldValue.serverTimestamp(),
				"metadata": null,
				"description": "",
				"name": "TEST PRODUCT",
				"accessControl": "public",
				"type": "good",
				"index": 0,
				"tags": [],
				"caption": "TEST PRODUCT CAPTION",
				"unitLabel": "",
				"providedBy": "TEST_PROVIDER",
				"images": [],
				"assets": [],
				"isAvailable": true,
				"salesMethod": salesMethod,
				"createdAt": admin.firestore.FieldValue.serverTimestamp()
			}
		)
	return ref
}

export const setupSKU = async (product: admin.firestore.DocumentReference, inventory: Inventory) => {
	const ref = admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}/skus/TEST_SKU-${inventory.type}`)
	await ref
		.set(
			{
				"taxRate": SKU_TAXRATE,
				"createdAt": admin.firestore.FieldValue.serverTimestamp(),
				"discount": null,
				"caption": "TEST PRODUCT CAPTION",
				"images": [],
				"index": 0,
				"tags": [],
				"inventory": inventory,
				"metadata": null,
				"createdBy": null,
				"isPrivate": false,
				"price": SKU_PRICE,
				"providedBy": "TEST_PROVIDER",
				"updatedAt": admin.firestore.FieldValue.serverTimestamp(),
				"description": "",
				"isAvailable": true,
				"productReference": product,
				"name": "TEST PRODUCT",
				"currency": "JPY",
				"assets": [],
				"shardCharacters": [
					"a",
					"b",
					"c"
				]
			}
		)
	if (inventory.type === "finite") {
		await admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}/skus/TEST_SKU-${inventory.type}/stocks/a`).set({ "count": 3 })
		await admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}/skus/TEST_SKU-${inventory.type}/stocks/b`).set({ "count": 3 })
		await admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}/skus/TEST_SKU-${inventory.type}/stocks/c`).set({ "count": 3 })
	}
	return ref
}


export const setupCustomer = async () => {
	await admin.firestore().doc("/commerce/v1/customers/TEST_CUSTOMER")
		.set(
			{
				"stripe": {
					"stripeLink": "https://dashboard.stripe.com/test/customers/cus_HusYOnNPlSfYSh",
					"customerID": "cus_HwPeoMuTLmy6sj"
				}
			}
		)
}

export const setupCart = async (product: admin.firestore.DocumentReference, sku: admin.firestore.DocumentReference) => {
	await admin.firestore().doc("/commerce/v1/carts/TEST_CUSTOMER")
		.set(
			{
				"groups": [
					{
						"items": [
							{
								"metadata": null,
								"images": [],
								"productReference": admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}`),
								"currency": "JPY",
								"caption": "TEST PRODUCT CAPTION",
								"description": "",
								"estimatedArrivalDate": null,
								"shipping": null,
								"mediatedBy": null,
								"productType": "good",
								"category": "",
								"quantity": 1,
								"taxRate": 8,
								"amount": 1000,
								"discount": null,
								"skuReference": admin.firestore().doc(`/commerce/v1/providers/TEST_PROVIDER/products/${product.id}/skus/${sku.id}`),
								"name": "TEST PRODUCT",
								"providedBy": "TEST_PROVIDER",
								"shippingDate": null
							}
						],
						"estimatedArrivalDate": null,
						"providedBy": "TEST_PROVIDER",
						"shipping": null,
						"currency": "JPY",
						"metadata": null,
						"salesMethod": "instore",
						"groupID": "TEST_PROVIDER-instore",
						"shippingDate": null
					}
				],
				"purchasedBy": null,
				"createdAt": admin.firestore.FieldValue.serverTimestamp(),
				"currency": "USD",
				"updatedAt": admin.firestore.FieldValue.serverTimestamp(),
				"metadata": null,
				"shipping": null,
				"amount": 0
			}
		)
}
