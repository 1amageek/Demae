import * as Account from "./account"
import * as BankAccount from "./externalAccount"
export const v1 = {
	account: { ...Account },
	bankAccount: { ...BankAccount }
}
