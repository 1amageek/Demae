import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select, { SelectProps } from '@material-ui/core/Select'

export const useSelect = <T extends unknown>(initValue?: T, props: SelectProps = {}): [SelectProps, Dispatch<SetStateAction<T>>] => {
	const [value, setValue] = useState<T>(initValue || '' as T)

	useEffect(() => setValue(initValue || '' as T), [initValue])

	const onChange = props.onChange || ((
		event: React.ChangeEvent<{ name?: string; value: unknown }>,
		child: React.ReactNode
	) => {
		const value = event.target.value as T
		setValue(value)
	})

	return [{ value, onChange, ...props } as SelectProps, setValue]
}

type MenuItemProps = {
	value?: string | number
	label: string
}

export const useMenu = (props: MenuItemProps[]) => {
	return props.map((menuItem, index) => {
		return <MenuItem key={index} value={menuItem.value}>{menuItem.label}</MenuItem>
	})
}

export default (props: SelectProps = {}) => <Select {...props} />
