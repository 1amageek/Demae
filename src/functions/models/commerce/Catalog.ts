import { Doc, Field, Collection, SubCollection, CollectionReference, firestore, GeoPoint, File } from "@1amageek/ballcap-admin"
import Product from "./Product"

export default class Catalog extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection("commerce/v1/catalogs")
	}

	@Field isAvailable: boolean = false
	@Field thumbnailImage?: File
	@Field coverImage?: File
	@Field title: string = ""
	@Field caption: string = ""
	@Field description: string = ""
	@Field country: string = "US"
	@Field location?: GeoPoint

	@SubCollection products: Collection<Product> = new Collection()
}
