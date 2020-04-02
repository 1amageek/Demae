import { useState, useEffect } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'

type InputProps = TextFieldProps

type InitProps = {
	initValue?: string
	inputProps?: InputProps
}

type InitValue = string | number | undefined

export const useInput = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || '')
		useEffect(() => {
			setValue(props || '')
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			onChange: handleChange
		};
	} else if (typeof props === 'number') {
		const [value, setValue] = useState(String(props) || '')
		useEffect(() => {
			setValue(String(props) || '')
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			type: 'number',
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
			onChange: handleChange
		};
	}
}

export default (props: InputProps) => {
	return (
		<TextField
			margin='normal'
			InputLabelProps={{
				shrink: true,
			}}
			{...props}
		/>
	)
}
