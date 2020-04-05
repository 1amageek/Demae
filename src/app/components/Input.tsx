import { useState, useEffect } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		input: {
			"&": {
				border: "red solid 2px"
			}
		}
	}),
);

type InitProps = {
	initValue?: string
	inputProps?: TextFieldProps
}

type InitValue = string | number | undefined

export const useInput = (props: InitProps | InitValue, textFieldProps?: TextFieldProps) => {
	if (typeof props === 'string' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || '')
		const [error, setError] = useState(false)
		useEffect(() => {
			setValue(props || '')
		}, [props])
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
			onChange: onChange,
			onBlur: onBlur
		};
	} else if (typeof props === 'number') {
		const [value, setValue] = useState(String(props) || '')
		useEffect(() => {
			setValue(String(props) || '')
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			...textFieldProps,
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

export default (props: TextFieldProps) => {
	const classes = useStyles()
	return (
		<TextField
			className={classes.input}
			margin='normal'
			InputLabelProps={{
				shrink: true,
			}}
			{...props}
		/>
	)
}
