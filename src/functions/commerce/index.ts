import * as Auth from "./auth"
import * as Admin from "./admin"
import * as Provider from "./provider"
import * as Product from "./product"
import * as Order from "./order"
import * as Inventory from "./inventory"

export const v1 = {
	auth: { ...Auth },
	admin: { ...Admin },
	provider: { ...Provider },
	product: { ...Product },
	order: { ...Order },
	inventory: { ...Inventory }
}
