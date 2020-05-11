import React from 'react'
import { Paper, IconButton, Button, TableRow, TableCell } from '@material-ui/core';
import Input, { useInput } from 'components/Input'
import EditIcon from '@material-ui/icons/Edit';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Box, CircularProgress } from '@material-ui/core'
import { useProcessing } from 'components/Processing';
import { SKU, Product } from 'models/commerce';
import { useDataSourceListen } from 'hooks/firestore';
import { Stock } from 'models/commerce/SKU';
import { useModal } from 'components/Modal';


export default ({ sku }: { sku: SKU }) => {

	const [setModal, close] = useModal()
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [_stocks, isLoading] = useDataSourceListen<Stock>(Stock, {
		path: sku.inventories.collectionReference.path
	})

	const stocks = _stocks || []
	const count = stocks.reduce((prev, current) => {
		return prev + current.count
	}, 0)

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	if (isLoading) {
		return (
			<TableRow>
				<TableCell align='right'><div>Stock count</div></TableCell>
				<TableCell align='left'><div><CircularProgress size='small' /></div></TableCell>
				<TableCell align='right'></TableCell>
			</TableRow>
		)
	}

	return (
		<TableRow>
			<TableCell align='right'><div>Stock count</div></TableCell>
			<TableCell align='left'><div>{count.toLocaleString()}</div></TableCell>
			<TableCell align='right'>
				<IconButton size="small" onClick={handleClick}>
					<EditIcon />
				</IconButton>
				<Menu
					anchorEl={anchorEl}
					keepMounted
					open={Boolean(anchorEl)}
					onClose={handleClose}
				>
					<MenuItem onClick={() => {
						handleClose()
						setModal(
							<Update sku={sku} callback={close} />
						)
					}}>Edit</MenuItem>
					<MenuItem onClick={() => {
						handleClose()
						setModal(
							<Increase sku={sku} callback={close} />
						)
					}}>Add</MenuItem>
				</Menu>
			</TableCell>
		</TableRow>
	)
}

const Update = ({ sku, callback }: { sku: SKU, callback: () => void }) => {

	const [setProcessing] = useProcessing()

	const updateCount = useInput(0)

	const update = async (event) => {
		event.preventDefault()
		const amount = Math.floor(Number(updateCount.value))
		if (amount > 0) {
			setProcessing(true)
			try {
				await sku.updateInventory(amount)
			} catch (error) {
				console.error(error)
			}
			setProcessing(false)
			callback()
		}
	}

	return (
		<form onSubmit={update}>
			<Paper>
				<Box padding={2} fontSize={18} fontWeight={500}>
					Overwrite inventory
					<Box maxWidth={600} minWidth={400} flexGrow={1} display='flex' alignItems='center' justifyContent='space-between'>
						<Input variant='outlined' margin='dense' required {...updateCount} />
						<Button type='submit' variant='contained' color='primary'>Update</Button>
					</Box>
				</Box>
			</Paper>
		</form>
	)
}

const Increase = ({ sku, callback }: { sku: SKU, callback: () => void }) => {

	const [setProcessing] = useProcessing()

	const incrementCount = useInput(0)

	const increase = async (event) => {
		event.preventDefault()
		const amount = Math.floor(Number(incrementCount.value))
		if (amount !== 0) {
			setProcessing(true)
			try {
				await sku.increaseInventory(amount)
			} catch (error) {
				console.error(error)
			}
			setProcessing(false)
			callback()
		}
	}
	return (
		<form onSubmit={increase}>
			<Paper>
				<Box padding={2} fontSize={18} fontWeight={500}>
					Add inventory
					<Box maxWidth={600} minWidth={400} flexGrow={1} display='flex' alignItems='center' justifyContent='space-between'>
						<Input variant='outlined' margin='dense' required {...incrementCount} />
						<Button type='submit' variant='contained' color='primary'>Add</Button>
					</Box>
				</Box>
			</Paper>
		</form>
	)
}
