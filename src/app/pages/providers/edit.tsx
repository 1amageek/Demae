import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import 'firebase/functions'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Login from 'components/Login'
import { useAuthUser, useProvider } from 'hooks'
import Loading from 'components/Loading'
import Input, { useInput } from 'components/Input'
import Provider from 'models/commerce/Provider'
import { UserContext } from 'context'
import { Create, Individual } from 'common/commerce/account'


export default () => {

	const provider = useProvider()
	return (
		<UserContext.Consumer>
			{user => {
				if (user) {
					if (provider) {
						return <Form provider={provider} />
					} else {
						return <Loading />
					}
				} else {
					return <Login />
				}
			}}
		</UserContext.Consumer>
	)
}

const Form = ({ provider }: { provider: Provider }) => {

	const [wasFetched, setFetched] = useState(false)
	useEffect(() => {
		(async () => {
			const result = await provider.fetch()
			setFetched(result.snapshot != undefined)
		})()
	}, [wasFetched])

	const name = useInput(provider.name)
	const caption = useInput(provider.caption)
	const description = useInput(provider.description)
	// const country = useInput(provider.country)
	// const defaultCurrency = useInput(provider.defaultCurrency)
	const email = useInput(provider.email)
	const phone = useInput(provider.phone)
	const address = useInput(provider.address)



	const shouldSubmit = () => {
		if (name.value.length === 0) {
			return false
		}
		if (caption.value.length === 0) {
			return false
		}
		if (description.value.length === 0) {
			return false
		}
		if (email.value.length === 0) {
			return false
		}
		if (phone.value.length === 0) {
			return false
		}
		return true
	}

	const onSubmit = async () => {
		// if (!shouldSubmit()) { return }
		provider.name = name.value
		provider.caption = caption.value
		provider.description = description.value
		provider.email = email.value
		provider.phone = phone.value
		provider.address = address.value
		await provider.save()
	}

	return (
		<form noValidate autoComplete="off">
			<FormControl>
				<Input label="name" {...name} />
				<Input label="caption" {...caption} />
				<Input label="description" {...description} />
				<Input label="email" {...email} />
				<Input label="phone" {...phone} />
				<Input label="address" {...address} />
			</FormControl>
			<Button variant="contained" color="primary" onClick={onSubmit}>
				Save
			</Button>
		</form>
	)

}

