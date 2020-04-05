import { useState } from 'react';
import Input, { useInput } from 'components/Input';
import Provider from 'models/commerce/Provider';
import User, { Role } from 'models/commerce/User';
import Account from 'models/account/Account';
import { Currency, Currencies } from 'common/Currency';
import { Country, Countries } from 'common/Country';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select, { useSelect } from 'components/Select'
import { BusinessType } from 'common/commerce/account';
import Router from 'next/router';
import Loading from 'components/Loading';
import { Batch } from '@1amageek/ballcap';


export default ({ uid, provider, account }: { uid: string, provider: Provider, account: Account }) => {

	const [open, setOpen] = useState(false)
	const [isLoading, setLoading] = useState(false)

	const name = useInput(provider.name)
	const country = useSelect({
		initValue: provider.country,
		inputProps: {
			menu: Countries
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
					label: 'Individual',
					value: 'individual'
				},
				{
					label: 'Company',
					value: 'company'
				}
			]
		}
	})

	const onSubmit = async (event) => {
		event.preventDefault()
		setLoading(true)
		provider.name = name.value
		provider.country = country.value as Country
		provider.defaultCurrency = defaultCurrency.value as Currency
		account.businessType = businessType.value as BusinessType
		const user = new User(uid)
		const role = user.roles.doc(provider.id, Role)
		try {
			const batch = new Batch()
			batch.save(provider)
			batch.save(account)
			batch.save(role)
			await batch.commit()
			Router.push(`/providers/${provider.id}`)
		} catch (error) {
			console.error(error)
			setLoading(false)
			setOpen(true)
		}
	}

	const handleClose = () => setOpen(false)

	return (
		<>
			<form autoComplete='off' onSubmit={onSubmit}>
				<Typography variant='h6' gutterBottom>
					Create new provider
    		</Typography>
				<FormControl fullWidth style={{ marginBottom: '24px' }}>
					<Input label='name' variant='outlined' margin='dense' size='small' {...name} style={{ marginBottom: '12px' }} />
					<Select label='businessType' {...businessType} />
					<Select label='country' {...country} />
					<Select label='currency' {...defaultCurrency} />
				</FormControl>
				<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
					Save
				</Button>
			</form>
			{isLoading && <Loading />}
			<Dialog
				open={open}
				onClose={handleClose}
			>
				<DialogTitle>Error</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Creation of provider failed. Please try again with good communication conditions.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='primary' autoFocus>
						OK
          </Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
