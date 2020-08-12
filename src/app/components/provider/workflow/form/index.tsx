import { useState, useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Provider, { ProviderDraft, Role, Capability } from 'models/commerce/Provider';
import User from 'models/commerce/User';
import { SupportedCurrencies, CurrencyCode } from 'common/Currency'
import { SupportedCountries, CountryCode } from 'common/Country';
import { FormControl, Button, Box, Typography, FormGroup, FormControlLabel, Checkbox, Divider, FormHelperText } from '@material-ui/core';
import Select, { useSelect, useMenu } from 'components/_Select'
import TextField, { useTextField } from "components/TextField"
import { useProcessing } from 'components/Processing'
import { Batch } from '@1amageek/ballcap';
import { useDialog } from 'components/Dialog'
import { useAuthUser } from 'hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			backgroundColor: '#fafafa'
		},
		bottomBox: {
			padding: theme.spacing(2),
			display: 'flex',
			justifyContent: 'flex-end'
		},
		input: {
			backgroundColor: '#fff'
		},
		cell: {
			borderBottom: 'none',
			padding: theme.spacing(1),
		},
		cellStatus: {
			borderBottom: 'none',
			padding: theme.spacing(1),
			width: '48px',
		},
		cellStatusBox: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	})
)

export default ({ country, onCallback }: { country: CountryCode, onCallback: (next: boolean) => void }) => {

	const classes = useStyles()
	const [auth] = useAuthUser()
	const [setProcessing] = useProcessing()
	const [setDialog] = useDialog()
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
		const provider = new ProviderDraft(uid)
		provider.name = name.value as string
		provider.country = country as CountryCode
		provider.defaultCurrency = defaultCurrency.value as CurrencyCode
		provider.capabilities = Object.keys(capabilities).filter(value => capabilities[value]) as Capability[]
		const user = new User(uid)
		const provierRole = new Role(new Provider(uid).members.collectionReference.doc(user.id))
		try {
			const batch = new Batch()
			batch.save(provider)
			batch.save(provierRole)
			await batch.commit()
			if (onCallback) {
				onCallback(true)
			}
		} catch (error) {
			console.error(error)
			setDialog('Error', 'Creation of provider failed. Please try again with good communication conditions.', [{
				title: 'OK',
				autoFocus: true
			}])
		}
		setProcessing(false)
	}

	return (
		<form autoComplete='off' onSubmit={onSubmit}>
			<Box className={classes.box}>
				<Box padding={2}>
					<Box paddingTop={2}>
						<Typography variant="h2" gutterBottom>Shop name</Typography>
						<Box paddingY={2}>
							<Typography variant="subtitle1" gutterBottom>Default Currency</Typography>
							<FormControl variant="outlined" margin="dense" size="small">
								<Select {...defaultCurrency}>
									{defaultCurrencyMenu}
								</Select>
							</FormControl>
						</Box>
						<Box paddingBottom={2}>
							<Typography variant="subtitle1" gutterBottom>Name</Typography>
							<TextField variant="outlined" margin="dense" required {...name} fullWidth />
						</Box>
					</Box>
					<Divider />
					<Box paddingTop={2}>
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
			</Box>
			<Box className={classes.bottomBox} >
				<Button onClick={() => {
					onCallback(false)
				}}>Back</Button>
				<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
					Save
				</Button>
			</Box>
		</form >
	)
}
