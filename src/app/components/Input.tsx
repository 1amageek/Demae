import { useState } from 'react'
import TextField from '@material-ui/core/TextField'

type InputProps = {
	id?: string
	label?: string
	type?: string
	placeholder?: string
	fullWidth?: boolean
	required?: boolean
	autoComplete?: string
	style?: Object
}

type InitProps = {
	initValue?: string
	inputProps?: InputProps
}

type InitValue = string | undefined

export const useInput = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'undefined') {
		const [value, setValue] = useState(props || "");
		const handleChange = e => setValue(e.target.value);
		return {
			value,
			onChange: handleChange,
			setValue
		};
	} else {
		const [value, setValue] = useState(props.initValue ? props.initValue : "");
		const handleChange = e => setValue(e.target.value);
		return {
			...props.inputProps,
			value,
			onChange: handleChange,
			setValue
		};
	}
}

export default (props: InputProps) => {
	return (
		<TextField
			margin="normal"
			InputLabelProps={{
				shrink: true,
			}}
			{...props}
		/>
	)
}



