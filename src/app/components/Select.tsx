import { useState, useEffect } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select, { SelectProps } from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

type MenuProp = {
	value: string
	label: string
} | {
	value: number
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
	controlProps?: any
	onChange?: (e) => void
	setValue?: React.Dispatch<React.SetStateAction<any>>
}

type InitProps = {
	initValue?: string | number | boolean
	inputProps?: InputProps
	controlProps?: any
}

type InitValue = string | number | undefined

export const useSelect = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || '')
		useEffect(() => {
			setValue(props || '')
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			setValue,
			onChange: handleChange
		};
	} else {
		const [value, setValue] = useState(props.initValue ? props.initValue : '')
		useEffect(() => {
			setValue(props.initValue ? props.initValue : '')
		}, [props.initValue])
		const handleChange = e => setValue(e.target.value)
		return {
			...props.inputProps,
			value,
			setValue,
			onChange: handleChange
		};
	}
}

export default (props: InputProps) => {
	const filterdKey = Object.keys(props).filter(key => key !== 'setValue')
	const filterdProps = filterdKey.reduce((prev, key) => {
		return {
			...prev,
			[key]: props[key]
		}
	}, {} as SelectProps)
	return (
		<FormControl variant='outlined' size='small' style={props.style} >
			{props.label && <InputLabel id={props.id}>{props.label}</InputLabel>}
			<Select
				{...filterdProps}
				style={{ marginTop: '8px', marginBottom: '4px' }}>
				{props.menu?.map(menu => {
					return <MenuItem key={menu.value} value={menu.value}>{menu.label}</MenuItem>
				})}
			</Select>
		</FormControl>
	)
}
