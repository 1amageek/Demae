export enum ErrorCode {
	resource_already_exists = 'resource_already_exists',
	resource_missing = 'resource_missing'
}

export const nullFilter = <T>(data: T) => {
	const mod = data
	Object.entries(mod).forEach(([key, val]) => {
		if (val == null) { delete mod[key as keyof T] }
    if (val instanceof Object) { mod[key as keyof T] = nullFilter(val) }
	})
	return mod
}
