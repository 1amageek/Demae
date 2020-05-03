import * as Account from './account'
import * as AccountLink from './accountLink'
import * as File from './file'
import * as Customer from './customer'
import * as PaymentMethod from './paymentMethod'
import * as PaymentIntent from './paymentIntent'
import * as Balance from './balance'
import * as BalanceTransaction from './balanceTransaction'
// import * as SubscriptionSchedule from './subscriptionSchedule'
export const account = { ...Account }
export const accountLink = { ...AccountLink }
export const file = { ...File }
export const customer = { ...Customer }
export const paymentMethod = { ...PaymentMethod }
export const paymentIntent = { ...PaymentIntent }
export const balance = { ...Balance }
export const balanceTransaction = { ...BalanceTransaction }
// export const subscriptionSchedule = { ...SubscriptionSchedule }
