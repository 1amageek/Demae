import * as Admin from './admin'
import * as Checkout from './checkout'
import * as Inventory from './inventory'
const admin = { ...Admin }
const checkout = { ...Checkout }
const inventory = { ...Inventory }

export const v1 = { admin, checkout, inventory }
