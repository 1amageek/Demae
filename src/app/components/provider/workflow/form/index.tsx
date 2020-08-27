import { useState, useContext } from "react";
import firebase from "firebase"
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Provider, { ProviderDraft, Role, Capability } from "models/commerce/Provider";
import User from "models/commerce/User";
import { SupportedCurrencies, CurrencyCode } from "common/Currency"
import { SupportedCountries, CountryCode } from "common/Country";
import { FormControl, Button, Paper, Box, Typography, FormGroup, FormControlLabel, Checkbox, Divider, FormHelperText } from "@material-ui/core";
import Select, { useSelect, useMenu } from "components/_Select"
import TextField, { useTextField } from "components/TextField"
import { useProcessing } from "components/Processing"
import { Batch } from "@1amageek/ballcap";
import { useDialog } from "components/Dialog"
import { useAuthUser } from "hooks/auth";


export default ({ country, onCallback }: { country: CountryCode, onCallback: (next: boolean) => void }) => {

	const [auth] = useAuthUser()
	const [setProcessing] = useProcessing()
	const [showDialog] = useDialog()
	const [name] = useTextField("")
	const [capabilities, setCapabilities] = useState<{ [key in Capability]: boolean }>({
		"download": false,
		"instore_sales": false,
		"online_sales": false,
		"takeout": false
	})
	const currencyInitValue = (country === "JP") ? "JPY" : "USD"
	const [defaultCurrency] = useSelect(currencyInitValue)
	const defaultCurrencyMenu = useMenu(SupportedCurrencies.map(currency => {
		return { label: `${currency.code} (${currency.name})`, value: currency.code }
	}))

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCapabilities({ ...capabilities, [event.target.name]: event.target.checked });
	}

	const error = Object.values(capabilities).filter((v) => v).length === 0;

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!auth) return;
		if (error) return
		const uid = auth.uid
		setProcessing(true)

		const data = {
			name: name.value,
			country: country,
			defaultCurrency: defaultCurrency.value,
			capabilities: Object.keys(capabilities).filter(value => capabilities[value]) as Capability[]
		}

		try {
			const providerCreate = firebase.functions().httpsCallable("commerce-v1-provider-create")
			const response = await providerCreate(data)
			const { error } = response.data
			if (error) {
				console.log(error)
				return
			}
			if (onCallback) {
				onCallback(true)
			}
		} catch (error) {
			console.error(error)
			showDialog("Error", "Creation of provider failed. Please try again with good communication conditions.", [{
				title: "OK",
				autoFocus: true
			}])
		}
		setProcessing(false)
	}

	return (
		<form autoComplete="off" onSubmit={onSubmit}>
			<Paper>
				<Box padding={2}>
					<Box>
						<Typography variant="h2" gutterBottom>Your service information</Typography>
						<Box paddingY={1}>
							<Typography variant="subtitle1">Name</Typography>
							<TextField variant="outlined" margin="dense" required {...name} fullWidth />
						</Box>
						<Box paddingY={1}>
							<Typography variant="subtitle1">Default Currency</Typography>
							<FormControl variant="outlined" margin="dense" size="small">
								<Select {...defaultCurrency}>
									{defaultCurrencyMenu}
								</Select>
							</FormControl>
						</Box>
					</Box>
					<Box paddingY={3}>
						<Divider />
					</Box>
					<Box>
						<Typography variant="h2" gutterBottom>Capability</Typography>
						<Typography>Please select a product sales method.</Typography>
						<Typography>Multiple selections are available.</Typography>
						<Box paddingY={2}>
							<Typography variant="subtitle1" gutterBottom>Sales method</Typography>
							<FormControl required error={error} component="fieldset">
								<FormGroup>
									<FormControlLabel
										control={<Checkbox checked={capabilities.download} onChange={handleChange} name="download" />}
										label="Download"
									/>
									<FormControlLabel
										control={<Checkbox checked={capabilities.instore_sales} onChange={handleChange} name="instore_sales" />}
										label="In-Store Sales"
									/>
									<FormControlLabel
										control={<Checkbox checked={capabilities.online_sales} onChange={handleChange} name="online_sales" />}
										label="Online Sales"
									/>
									<FormControlLabel
										control={<Checkbox checked={capabilities.takeout} onChange={handleChange} name="takeout" />}
										label="Takeout"
									/>
								</FormGroup>
								{error && <FormHelperText>You must select one or more.</FormHelperText>}
							</FormControl>
						</Box>
					</Box>
				</Box>
				<Box display="flex" padding={2}>
					<Button onClick={() => {
						onCallback(false)
					}}>Back</Button>
					<Button fullWidth
						disabled={error}
						variant="contained"
						size="large"
						color="primary"
						type="submit">
						Save
					</Button>
				</Box>
			</Paper>
		</form >
	)
}
