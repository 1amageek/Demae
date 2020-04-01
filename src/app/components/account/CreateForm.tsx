import Input, { useInput } from 'components/Input';
import Provider from 'models/commerce/Provider';
import User, { Role } from 'models/commerce/User';
import Account from 'models/account/Account';
import { Currency, Currencies } from 'common/Currency';
import { Country, Countries } from 'common/Country';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Select, { useSelect } from 'components/Select'
import { BusinessType } from 'common/commerce/account';
import Router from 'next/Router'

export default ({ uid, provider, account }: { uid: string, provider: Provider, account: Account }) => {

	const name = useInput(provider.name)
	const country = useSelect({
		initValue: provider.country,
		inputProps: {
			menu: Countries.map(c => {
				return { label: c, value: c }
			})
		}
	})
	const defaultCurrency = useSelect({
		initValue: provider.defaultCurrency,
		inputProps: {
			menu: Currencies.map(c => {
				return { label: c, value: c }
			})
		}
	})

	const businessType = useSelect({
		initValue: account.businessType, inputProps: {
			menu: [
				{
					label: "Individual",
					value: "individual"
				},
				{
					label: "Company",
					value: "company"
				}
			]
		}
	})

	const onSubmit = async () => {
		provider.name = name.value
		provider.country = country.value as Country
		provider.defaultCurrency = defaultCurrency.value as Currency
		account.businessType = businessType.value as BusinessType
		const user = new User(uid)
		const role = user.roles.doc(provider.id, Role)
		await Promise.all([provider.save(), account.save(), role.save()])
		Router.push(`/providers/${provider.id}`)
	}

	return (
		<>
			<form noValidate autoComplete="off">
				<Typography variant="h6" gutterBottom>
					Create new provider
    		</Typography>
				<FormControl fullWidth style={{ marginBottom: '28px' }}>
					<Select label="businessType" {...businessType} />
					<Input label="name" {...name} />
					<Select label="country" {...country} />
					<Select label="currency" {...defaultCurrency} />
				</FormControl>
				<Button fullWidth variant="contained" size="large" color="primary" onClick={onSubmit}>
					Save
				</Button>
			</form>
		</>
	)
}
