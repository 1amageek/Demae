import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Checkbox, FormControlLabel } from '@material-ui/core';
import { List, ListItem, ListItemText, ListItemIcon, Button } from '@material-ui/core';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Tooltip, IconButton } from '@material-ui/core';
import { useUserShippingAddresses } from 'hooks/commerce'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Loading from 'components/Loading'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider, Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DataLoading from 'components/DataLoading';
import * as Commerce from 'models/commerce'
import Select, { useSelect } from 'components/Select'
import Input, { useInput } from 'components/Input';
import { SupportedCountries } from 'common/Country';
import { useAuthUser } from 'hooks/auth'
import { useDialog } from 'components/Dialog'
import { usePush, usePop } from 'components/Navigation';
import { Shipping } from 'models/commerce';

export default ({ user }: { user: Commerce.User }) => {

	const [shippingAddresses, isLoading] = useUserShippingAddresses()

	const [setDialog, close] = useDialog()
	const [push] = usePush()
	const pop = usePop()

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Tooltip title='Back' onClick={() => {
						pop()
					}}>
						<IconButton>
							<ArrowBackIcon color='inherit' />
						</IconButton>
					</Tooltip>
					<Box fontSize={18} fontWeight={600}>
						Shipping Address
					</Box>
				</Toolbar>
			</AppBar>
			{
				shippingAddresses.map(shipping => {
					console.log(shipping.id)
					return (
						<ExpansionPanel key={shipping.id} >
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<FormControlLabel
									onClick={async (event) => {
										event.stopPropagation()
										if (!user) return;
										user.defaultShipping = shipping
										await user?.save()
									}}
									onFocus={(event) => event.stopPropagation()}
									control={<Checkbox checked={user?.defaultShipping?.id === shipping.id} />}
									label={
										<Typography>{shipping.format(['postal_code', 'line1'])}</Typography>
									}
								/>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<Typography>
									{shipping.formatted()}
								</Typography>
							</ExpansionPanelDetails>
							<Divider />
							<ExpansionPanelActions>
								<Button size="small" onClick={async () => {
									setDialog('Delete', 'Do you want to remove it?', [
										{
											title: 'Cancel',
											handler: close
										},
										{
											title: 'OK',
											handler: async () => {
												if (user?.defaultShipping?.id === shipping.id) {
													setDialog('Selected shipping address', 'This shipping address is currently selected. To delete this shipping address, please select another shipping address first.',
														[
															{
																title: 'OK'
															}])
												} else {
													await shipping?.delete()
												}
											}
										}])
								}}>Delete</Button>
								<Button size="small" color="primary" onClick={() => {
									if (!user) return;
									push(
										<ShippingAddress user={user} shipping={shipping} />
									)
								}}>
									Edit
          			</Button>
							</ExpansionPanelActions>
						</ExpansionPanel>
					)
				})
			}
			<List>
				<ListItem button onClick={() => {
					if (!user) return;
					const shipping = new Shipping(user.shippingAddresses.collectionReference.doc())
					push(
						<ShippingAddress user={user} shipping={shipping} />
					)
				}}>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new shpping address`} />
				</ListItem>
			</List>
		</Paper>
	)
}

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

const ShippingAddress = ({ user, shipping }: { user: Commerce.User, shipping: Shipping }) => {
	return <Form user={user} shipping={shipping} />
}

const Form = ({ user, shipping }: { user: Commerce.User, shipping: Shipping }) => {
	const classes = useStyles()
	const [auth] = useAuthUser();
	const [isProcessing, setProcessing] = useState(false)
	const country = useSelect({
		initValue: shipping.address?.country || user.country || "US",
		inputProps: {
			menu: SupportedCountries.map(country => {
				return { value: country.alpha2, label: country.name }
			})
		}
	})
	const state = useInput(shipping.address?.state)
	const city = useInput(shipping.address?.city)
	const line1 = useInput(shipping.address?.line1)
	const line2 = useInput(shipping.address?.line2)
	const postal_code = useInput(shipping.address?.postal_code)
	const name = useInput(shipping.name)
	const pop = usePop()

	const onSubmit = async (event) => {
		event.preventDefault()
		if (!auth) return;
		const uid = auth.uid
		setProcessing(true)
		// shipping.country = country.value
		shipping.address = {
			// country: country.value,
			state: state.value,
			city: city.value,
			line1: line1.value,
			line2: line2.value,
			postal_code: postal_code.value
		}
		shipping.name = name.value
		shipping.phone = auth!.phoneNumber || ''
		await Promise.all([
			shipping.save(),
			user.documentReference.set({ defaultShipping: shipping.convert({ convertDocument: true }) }, { merge: true })
		])
		pop()
		setProcessing(false)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar disableGutters>
					<Tooltip title='Back' onClick={() => {
						pop()
					}}>
						<IconButton>
							<ArrowBackIcon color='inherit' />
						</IconButton>
					</Tooltip>
					<Box fontSize={18} fontWeight={600}>
						Shipping Address
					</Box>
				</Toolbar>
			</AppBar>
			<form autoComplete='off' onSubmit={onSubmit}>
				<Box className={classes.box}>
					<Table size='small'>
						<TableBody>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>country</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Select {...country} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>state</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='state' variant='outlined' margin='dense' size='small' required {...state} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>city</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='city' variant='outlined' margin='dense' size='small' required {...city} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>line1</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='line1' variant='outlined' margin='dense' size='small' required {...line1} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>line2</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='line2' variant='outlined' margin='dense' size='small' {...line2} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>postal code</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='postal code' variant='outlined' margin='dense' size='small' required  {...postal_code} />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className={classes.cellStatus}></TableCell>
								<TableCell className={classes.cell} align='right'>name</TableCell>
								<TableCell className={classes.cell} align='left'>
									<Input className={classes.input} label='name' variant='outlined' margin='dense' size='small' required  {...name} />
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Button fullWidth variant='contained' size='large' color='primary' type='submit'>
						Continue to Payment
					</Button>
				</Box>
			</form>
			{isProcessing && <Loading />}
		</Paper>
	)
}
