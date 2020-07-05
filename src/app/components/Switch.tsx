import { useState, useEffect, Dispatch, SetStateAction } from "react"
import Switch, { SwitchProps } from "@material-ui/core/Switch"

export const useSwitch = (initValue: boolean, props: SwitchProps = {}): [SwitchProps, Dispatch<SetStateAction<boolean>>] => {
	const [value, setValue] = useState<boolean>(initValue)

	useEffect(() => setValue(initValue), [])

	const onChange = props.onChange || ((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value as unknown as boolean
		setValue(value)
	})

	return [{ value, onChange, ...props } as SwitchProps, setValue]
}

export default (props: SwitchProps = {}) => <Switch {...props} />
