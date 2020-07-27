import React, { useState } from "react";
import firebase from "firebase"
import "firebase/functions"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import { useAuthUser } from "hooks/auth"
import Input, { useInput } from "components/Input"
import Account from "models/account/Account"
import { Create, Individual } from "common/commerce/account"


export default () => {

	const onSubmit = async () => {
		// product.name = name
		// product.caption = caption
		// product.description = description
		// try {
		// 	await product.save()
		// } catch (error) {
		// 	console.error(error)
		// }
	}

	return (
		<IndividualForm individual={{}} />
	);
}

const IndividualForm = ({ individual }: { individual: Partial<Individual> }) => {

	const [authUser] = useAuthUser()

	const first_name = useInput(individual.first_name)
	const last_name = useInput(individual.last_name)
	const email = useInput(individual.email)
	const phone = useInput(individual.phone)

	const year = useInput(individual.dob?.year)
	const month = useInput(individual.dob?.month)
	const day = useInput(individual.dob?.day)

	const shouldSubmit = () => {
		if (!authUser) {
			return false
		}
		if (first_name.value.length === 0) {
			return false
		}
		if (last_name.value.length === 0) {
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

		const uid = authUser?.uid
		if (!uid) return
		if (!shouldSubmit()) return

		const data: Create = {
			type: "custom",
			country: "US",
			business_type: "individual",
			requested_capabilities: ["card_payments", "transfers"],
			individual: {
				last_name: last_name.value,
				first_name: first_name.value,
				dob: {
					year: Number(year.value),
					month: Number(month.value),
					day: Number(day.value)
				}
			}
		}

		const accountCreate = firebase.app().functions("us-central1").httpsCallable("stripe-v1-account-create")
		try {
			const result = await accountCreate(data)
			const account = new Account(uid)
			account.accountID = result.data.id
			account.country = result.data.country
			account.businessType = result.data.business_type
			account.email = result.data.email
			await account.save()
			console.log(result)
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<form noValidate autoComplete="off">
			<FormControl>
				<Input label="first name" {...first_name} />
				<Input label="last name" {...last_name} />
				<Input label="email" {...email} />
				<Input label="phone" {...phone} />
				<Input label="year" {...year} />
				<Input label="month" {...month} />
				<Input label="day" {...day} />
			</FormControl>
			<Button variant="contained" color="primary" onClick={onSubmit}>
				Save
			</Button>
		</form>
	)

}

