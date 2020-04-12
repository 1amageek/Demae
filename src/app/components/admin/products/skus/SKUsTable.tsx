import React from 'react';
import Link from 'next/link'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import StatusCell from 'components/admin/StatusCell';

export default ({ product, skus, setSKU }: { product: Product, skus: SKU[], setSKU?: (sku: SKU) => void }) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell align='left'>Name</TableCell>
					<TableCell align='left'>Currency</TableCell>
					<TableCell align='left'>Amount</TableCell>
					<TableCell align='left'>Inventory</TableCell>
					<TableCell align='left'>Status</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{skus.map(data => {
					return (
						<TableRow hover key={data.id} onClick={() => {
							if (setSKU) setSKU(data)
						}}>
							<TableCell align='left'><div>{data.name}</div></TableCell>
							<TableCell align='left'><div>{data.currency}</div></TableCell>
							<TableCell align='left'><div>{data.amount.toLocaleString()}</div></TableCell>
							<TableCell align='left'>
								<div>
									{data.inventory.type === 'infinite' && 'Infinite'}
									{data.inventory.type === 'bucket' && data.inventory.value}
									{data.inventory.type === 'finite' && data.inventory.quantity}
								</div>
							</TableCell>
							<StatusCell isAvalabled={data.isAvailable} onChangeStatus={() => { }} />
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}
