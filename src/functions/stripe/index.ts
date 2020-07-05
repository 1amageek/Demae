import * as Account from "./account"
import * as AccountLink from "./accountLink"
import * as File from "./file"
import * as Customer from "./customer"
import * as PaymentMethod from "./paymentMethod"
import * as PaymentIntent from "./paymentIntent"
import * as Balance from "./balance"
import * as BalanceTransaction from "./balanceTransaction"
// import * as SubscriptionSchedule from "./subscriptionSchedule"
const account = { ...Account }
const accountLink = { ...AccountLink }
const file = { ...File }
const customer = { ...Customer }
const paymentMethod = { ...PaymentMethod }
const paymentIntent = { ...PaymentIntent }
const balance = { ...Balance }
const balanceTransaction = { ...BalanceTransaction }
// const subscriptionSchedule = { ...SubscriptionSchedule }

export const v1 = { account, accountLink, file, customer, paymentMethod, paymentIntent, balance, balanceTransaction }
