import { Doc, Field } from "@1amageek/ballcap"

export default class User extends Doc {
	static modelName(): string {
		return 'users'
	}
	@Field name: string = ""
}
