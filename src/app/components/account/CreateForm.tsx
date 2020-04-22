import { useState, useContext } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import Input, { useInput } from 'components/Input';
import Provider from 'models/commerce/Provider';
import User, { Role } from 'models/commerce/User';
import Account from 'models/account/Account';
import { CurrencyCodes, CurrencyCode } from 'common/Currency';
import { Country, Countries } from 'common/Country';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Toolbar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Select, { useSelect } from 'components/Select'
import { BusinessType } from 'common/commerce/account';
import { useProcessing } from 'components/Processing'
import { Batch } from '@1amageek/ballcap';
import { useDialog, DialogProps } from 'components/Dialog'
import { AuthContext } from 'hooks/commerce';

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

const _ErrorDialog = (props: DialogProps) => (
	<Dialog
		open={props.open}
		onClose={props.onClose}
	>
		<DialogTitle>Error</DialogTitle>
		<DialogContent>
			<DialogContentText>
				Creation of provider failed. Please try again with good communication conditions.
					</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={props.onNext} color='primary' autoFocus>
				OK
      </Button>
		</DialogActions>
	</Dialog>
)

export default () => {
	const classes = useStyles()
	const [auth] = useContext(AuthContext)
	const history = useHistory()
	const [isProcessing, setProcessing] = useProcessing()
	const [setOpen, ErrorDialog] = useDialog(_ErrorDialog, () => {
		setOpen(false)

	})
	const name = useInput("")
	const country = useSelect({
		initValue: "US",
		inputProps: {
			menu: Countries
		}
	})
	const defaultCurrency = useSelect({
		initValue: "USD",
		inputProps: {
			menu: CurrencyCodes.map(c => {
				return { label: c, value: c }
			})
		}
	})
	const businessType = useSelect({
		initValue: "individual", inputProps: {
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
		if (!auth) return;
		const uid = auth.uid
		setProcessing(true)
		const provider = new Provider(uid)
		const account = new Account(uid)
		provider.name = name.value
		provider.country = country.value as Country
		provider.defaultCurrency = defaultCurrency.value as CurrencyCode
		account.businessType = businessType.value as BusinessType
		const user = new User(uid)
		const role = user.roles.doc(provider.id, Role)
		try {
			const batch = new Batch()
			batch.save(provider)
			batch.save(account)
			batch.save(role)
			await batch.commit()
			history.push('/admin')
		} catch (error) {
			console.error(error)
			setOpen(true)
		}
		setProcessing(false)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Typography variant='h6'>
						Create new provider
          </Typography>
				</Toolbar>
			</AppBar>
			<form autoComplete='off' onSubmit={onSubmit}>
				<Box className={classes.box}>
					<Table size='small'>
						<TableBody>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>BusinessType</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Select {...businessType} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>store name</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='name' variant='outlined' margin='dense' size='small' {...name} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>country</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Select {...country} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>currency</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Select {...defaultCurrency} />
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
						Save
					</Button>
				</Box>
			</form>
			<ErrorDialog />
		</Paper>
	)
}
