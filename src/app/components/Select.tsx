import { useState, useEffect } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

type MenuProp = {
	value: string | number
	label: string
}

type InputProps = {
	id?: string
	label?: string
	type?: string
	placeholder?: string
	fullWidth?: boolean
	required?: boolean
	autoComplete?: string
	style?: Object
	menu?: MenuProp[]
}

type InitProps = {
	initValue?: string | number | boolean
	inputProps?: InputProps
}

type InitValue = string | number | undefined

export const useSelect = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || "")
		useEffect(() => {
			setValue(props || "")
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			onChange: handleChange
		};
	} else {
		const [value, setValue] = useState(props.initValue ? props.initValue : "")
		useEffect(() => {
			setValue(props.initValue ? props.initValue : "")
		}, [props.initValue])
		const handleChange = e => setValue(e.target.value)
		return {
			...props.inputProps,
			value,
			onChange: handleChange
		};
	}
}

export default (props: InputProps) => {
	return (
		<FormControl style={{ marginBottom: '12px' }}>
			{props.label && <InputLabel id={props.id}>{props.label}</InputLabel>}
			<Select {...props}>
				{props.menu?.map(menu => {
					return <MenuItem value={menu.value}>{menu.label}</MenuItem>
				})}
			</Select>
		</FormControl>
	)
}
