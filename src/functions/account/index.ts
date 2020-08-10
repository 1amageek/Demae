import * as Auth from "./auth"
import * as Account from "./account"

export const v1 = {
	auth: { ...Auth },
	account: { ...Account }
}
