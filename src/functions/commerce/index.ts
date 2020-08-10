import * as Auth from "./auth"
import * as Admin from "./admin"
import * as Product from "./product"
import * as Order from "./order"
import * as Inventory from "./inventory"

export const v1 = {
	auth: { ...Auth },
	admin: { ...Admin },
	product: { ...Product },
	order: { ...Order },
	inventory: { ...Inventory }
}
