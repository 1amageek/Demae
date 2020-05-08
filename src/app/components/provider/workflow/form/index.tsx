import { useState, useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Input, { useInput } from 'components/Input';
import Provider from 'models/commerce/Provider';
import User, { Role } from 'models/commerce/User';
import { SupportedCurrencies, CurrencyCode } from 'common/Currency'
import { Country, Countries } from 'common/Country';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Select, { useSelect } from 'components/Select'
import { useProcessing } from 'components/Processing'
import { Batch } from '@1amageek/ballcap';
import { useDialog } from 'components/Dialog'
import { useAuthUser } from 'hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			padding: theme.spacing(2),
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

export default ({ country, onCallback }: { country: Country, onCallback: (next: boolean) => void }) => {

	const classes = useStyles()
	const [auth] = useAuthUser()
	const [setProcessing] = useProcessing()
	const [setDialog] = useDialog()
	const name = useInput("")
	const currencyInitValue = (country === "JP") ? "JPY" : "USD"
	const defaultCurrency = useSelect({
		initValue: currencyInitValue,
		inputProps: {
			menu: SupportedCurrencies.map(currency => {
				return { label: `${currency.code} (${currency.name})`, value: currency.code }
			})
		}
	})

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!auth) return;
		const uid = auth.uid
		setProcessing(true)
		const provider = new Provider(uid)
		provider.name = name.value
		provider.country = country as Country
		provider.defaultCurrency = defaultCurrency.value as CurrencyCode
		const user = new User(uid)
		const role = user.roles.doc(provider.id, Role)
		try {
			const batch = new Batch()
			batch.save(provider)
			batch.save(role)
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
				<Table size='small'>
					<TableBody>
						<TableRow>
							<TableCell className={classes.cellStatus}></TableCell>
							<TableCell className={classes.cell} align='right'>Shop name</TableCell>
							<TableCell className={classes.cell} align='left'>
								<Input className={classes.input} label='name' variant='outlined' margin='dense' size='small' required {...name} />
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.cellStatus}></TableCell>
							<TableCell className={classes.cell} align='right'>Currency</TableCell>
							<TableCell className={classes.cell} align='left'>
								<Select {...defaultCurrency} />
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Box>
			<Box className={classes.bottomBox} >
				<Button onClick={() => {
					onCallback(false)
				}}>Back</Button>
				<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
					Save
				</Button>
			</Box>
		</form>
	)
}
