import * as Admin from "./admin"
import * as Order from "./order"
import * as Inventory from "./inventory"
const admin = { ...Admin }
const order = { ...Order }
const inventory = { ...Inventory }

export const v1 = { admin, order, inventory }
