import React from "react"
import firebase from "firebase"
import "firebase/functions"
import { Box, Button, Paper, useMediaQuery } from "@material-ui/core"

export default () => {
	return (
		<Box>
			<Button onClick={async (e) => {
				e.preventDefault()
				// const accountCreate = firebase.app().functions("us-central1").httpsCallable("stripe-v1-account-create")
				// try {
				// 	const data = {
				// 		type: "custom",
				// 		country: "JPY",
				// 		requested_capabilities: ["card_payments", "transfers"],
				// 	}
				// 	const response = await accountCreate(data)
				// 	const { result, error } = response.data
				// } catch (error) {
				// 	console.error(error)
				// }

				const accountLinkCreate = firebase.app().functions("us-central1").httpsCallable("stripe-v1-accountLink-create")

				try {
					const response = await accountLinkCreate({

					})
					const { result, error } = response.data
					console.log(result, error)

				} catch (error) {

				}


			}} title="Create">Create</Button>
		</Box>
	)
}
