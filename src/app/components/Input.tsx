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

type InitValue = string | number | undefined

export const useInput = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || "");
		const handleChange = e => setValue(e.target.value);
		return {
			value,
			onChange: handleChange
		};
	} else if (typeof props === 'number') {
		const [value, setValue] = useState(String(props) || "");
		const handleChange = e => setValue(e.target.value);
		return {
			value,
			type: 'number',
			onChange: handleChange
		};
	} else {
		console.log(props)
		const [value, setValue] = useState(props.initValue ? props.initValue : "");
		const handleChange = e => setValue(e.target.value);
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
			margin="normal"
			InputLabelProps={{
				shrink: true,
			}}
			{...props}
		/>
	)
}



