import * as functions from "firebase-functions"
export const regionFunctions = functions.region("us-central1")

export const nullFilter = <T>(data: T) => {
	const mod = data
	Object.entries(mod).forEach(([key, val]) => {
		if (val === null) { delete mod[key as keyof T] }
		if (val === undefined) { delete mod[key as keyof T] }
		if (val instanceof Object) { mod[key as keyof T] = nullFilter(val) }
	})
	return mod
}
