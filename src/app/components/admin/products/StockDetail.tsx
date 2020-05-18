
import React from 'react'
import { Tooltip, IconButton, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { Avatar, Box } from '@material-ui/core';
import Input, { useInput } from 'components/Input'
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useProcessing } from 'components/Processing';
import { SKU, Product } from 'models/commerce';
import { useDataSourceListen } from 'hooks/firestore';
import { Stock } from 'models/commerce/SKU';


export default ({ sku }: { sku: SKU }) => {

	const [setProcessing] = useProcessing()
	const [_stocks, isLoading] = useDataSourceListen<Stock>(Stock, {
		path: sku.stocks.collectionReference.path
	})

	const stocks = _stocks || []
	const count = stocks.reduce((prev, current) => {
		return prev + current.count
	}, 0)

	const updateCount = useInput(0)
	const incrementCount = useInput(0)

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
		}
	}

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
		}
	}

	if (isLoading) {
		return (
			<Board header={
				<Typography variant='h6'>
					No choise product
				</Typography>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	return (
		<Board header={
			<Box display="flex" flexGrow={1} fontWeight={500} fontSize={20}>
				Inventory
				</Box>
		}>

			<Table>
				<TableBody>
					<TableRow>
						<TableCell align='right'><div>Current</div></TableCell>
						<TableCell align='left'><div>{count.toLocaleString()}</div></TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<form onSubmit={update}>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell align='right'><div>Update</div></TableCell>
							<TableCell align='left'>
								<div>
									<Box flexGrow={1} display='flex' alignItems='center' justifyContent='space-between'>
										<Input variant='outlined' margin='dense' style={{ width: '110px' }} required {...updateCount} />
										<Button type='submit' variant='contained' color='primary'>Update</Button>
									</Box>
								</div>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</form>
			<form onSubmit={increase}>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell align='right'><div>Increase</div></TableCell>
							<TableCell align='left'>
								<div>
									<Box flexGrow={1} display='flex' alignItems='center' justifyContent='space-between'>
										<Input variant='outlined' margin='dense' style={{ width: '110px' }} required {...incrementCount} />
										<Button type='submit' variant='contained' color='primary'>Increase</Button>
									</Box>
								</div>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</form>
		</Board>
	)
}
