import { useState } from 'react'
import TextField from '@material-ui/core/TextField'

type InitProps = {
	initValue?: string
	inputProps?: {
		id?: string
		label?: string
		type?: string
		placeholder?: string
		required?: boolean
		autoComplete?: string
		style?: Object
	}
}

export const useInput = (props: InitProps) => {
	const [value, setValue] = useState(props.initValue ? props.initValue : "");
	const handleChange = e => setValue(e.target.value);

	return {
		...props.inputProps,
		value,
		onChange: handleChange,
		setValue
	};
}

export default ({ props }: { props: InitProps }) => (
	<TextField
		fullWidth
		margin="normal"
		InputLabelProps={{
			shrink: true,
		}}
		{...props}
	/>
)
