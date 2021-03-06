import React from 'react'
import { Paper, IconButton, Button, Box, CircularProgress } from '@material-ui/core';
import Input, { useInput } from 'components/Input'
import EditIcon from '@material-ui/icons/Edit';
import { Menu, MenuItem } from '@material-ui/core';
import { useProcessing } from 'components/Processing';
import { SKU, Product } from 'models/commerce';
import { useDataSourceListen } from 'hooks/firestore';
import { Stock } from 'models/commerce/SKU';
import { useModal } from 'components/Modal';


export default ({ sku }: { sku: SKU }) => {

	const providerRef = sku.documentReference.parent.parent!.parent.parent!
	const productID = sku.documentReference.parent.parent!.id
	const [setModal, close] = useModal()
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [_stocks, isLoading] = useDataSourceListen<Stock>(Stock, {
		path: providerRef
			.collection("products").doc(productID)
			.collection("skus").doc(sku.id)
			.collection("stocks").path
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
			<Box display="flex" alignItems="center" padding={2}>
				<Box>Stock count</Box>
				<Box><CircularProgress /></Box>
			</Box>
		)
	}

	return (
		<Box display="flex" alignItems="center" padding={2}>
			<Box>Stock count</Box>
			<Box paddingX={1}>{count.toLocaleString()}</Box>
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
		</Box>
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
