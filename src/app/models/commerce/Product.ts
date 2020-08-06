import { Doc, Field, Collection, SubCollection, firestore, CollectionReference, File } from "@1amageek/ballcap"
import { CurrencyCode } from "common/Currency"
import Plan from "./Plan"
import SKU from "./SKU"

export type ProductType = "service" | "good"

export type DeliveryMethod = "none" | "shipping" | "pickup" | "download"

export type AccessControl = "public" | "private" | "limited"

export class ProductDraft extends Doc {
	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/productDrafts")
	}

	@Field index: number = 0
	@Field providedBy!: string
	@Field images: File[] = []
	@Field assets: File[] = []
	@Field tags: string[] = []
	@Field type: ProductType = "good"
	@Field name: string = "No Name"
	@Field caption?: string
	@Field description?: string
	@Field unitLabel: string = ""
	@Field price: { [key in CurrencyCode]?: number } = {}
	@Field deliveryMethod: DeliveryMethod = "none"
	@Field accessControl: AccessControl = "public"
	@Field metadata?: any
	@SubCollection skus: Collection<SKU> = new Collection()
	@SubCollection plans: Collection<Plan> = new Collection()

	imagePaths(): string[] {
		return this.images.map(image => {
			if (image) {
				return image.path
			}
			return undefined
		}).filter(value => !!value) as string[]
	}

	imageURLs(): string[] {
		return this.images.map(image => {
			if (image) {
				return `${process.env.HOST}/assets/${image.path}`
			}
			return undefined
		}).filter(value => !!value) as string[]
	}
}


export default class Product extends ProductDraft {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/products")
	}

	@Field isAvailable: boolean = true
}
