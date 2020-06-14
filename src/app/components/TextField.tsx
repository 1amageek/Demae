import { useState, useEffect } from 'react'
import TextField, { TextFieldProps, StandardTextFieldProps, FilledTextFieldProps, OutlinedTextFieldProps } from '@material-ui/core/TextField'

export const useTextField = (initValue?: string, props: TextFieldProps = {}): TextFieldProps => {
	const [value, setValue] = useState<string>(initValue || '')
	const [error, setError] = useState(false)

	useEffect(() => setValue(initValue || ''), [])

	const onChange = props.onChange || ((e) => {
		const value = e.target.value
		setValue(value)
		if (props.inputProps && value && error) {
			const pattern = props.inputProps['pattern']
			const regex = new RegExp(pattern)
			setError(!value.match(regex))
		}
	})

	const onBlur = props.onBlur || ((e) => {
		const value = e.target.value
		if (props.inputProps && value) {
			const pattern = props.inputProps['pattern']
			const regex = new RegExp(pattern)
			setError(!value.match(regex))
		}
	})

	return { value, error, onChange, onBlur, ...props } as TextFieldProps
}

export default (props: TextFieldProps = {}) => <TextField {...props} />
