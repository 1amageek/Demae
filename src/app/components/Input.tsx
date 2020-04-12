import { useState, useEffect } from 'react'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'

type InitProps = {
	initValue?: string
	inputProps?: TextFieldProps
}

type InitValue = string | number | undefined

export const useInput = (props: InitProps | InitValue, textFieldProps?: TextFieldProps) => {
	if (typeof props === 'string' || typeof props === 'undefined' || typeof props === 'number' || props === null) {
		const initValue = String(props || '')
		const [value, setValue] = useState(initValue)
		const [error, setError] = useState(false)
		useEffect(() => {
			setValue(initValue)
		}, [])
		const onChange = e => {
			const value = e.target.value
			setValue(value)
			if (textFieldProps && value && error) {
				const inputProps = (textFieldProps as any).inputProps
				if (inputProps) {
					const pattern = inputProps.pattern
					if (pattern) {
						const regex = new RegExp(pattern)
						setError(!value.match(regex))
					}
				}
			}
		}
		const onBlur = e => {
			const value = e.target.value
			if (textFieldProps && value) {
				const inputProps = (textFieldProps as any).inputProps
				if (inputProps) {
					const pattern = inputProps.pattern
					if (pattern) {
						const regex = new RegExp(pattern)
						setError(!value.match(regex))
					}
				}
			}
		}
		return {
			...textFieldProps,
			value,
			error,
			setValue,
			onChange: onChange,
			onBlur: onBlur
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

export default (props: TextFieldProps) => {
	const filterdKey = Object.keys(props).filter(key => key !== 'setValue')
	const filterdProps = filterdKey.reduce((prev, key) => {
		return {
			...prev,
			[key]: props[key]
		}
	}, {} as TextFieldProps)
	return (
		<TextField
			margin='normal'
			InputLabelProps={{
				shrink: true,
			}}
			{...filterdProps}
		/>
	)
}
