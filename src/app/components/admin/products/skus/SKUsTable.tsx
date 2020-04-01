import React from 'react';
import Link from 'next/link'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'

export default ({ product, skus }: { product: Product, skus: SKU[] }) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell align='center'>ID</TableCell>
					<TableCell align='center'>Name</TableCell>
					<TableCell align='center'>Currency</TableCell>
					<TableCell align='center'>Amount</TableCell>
					<TableCell align='center'>Inventory</TableCell>
					<TableCell align='center'>Status</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{skus.map(data => {
					return (
						<Link href={`/admin/products/${product.id}/skus/${data.id}`} key={data.id} >
							<TableRow hover key={data.id}>
								<TableCell align='center'><div>{data.id}</div></TableCell>
								<TableCell align='center'><div>{data.name}</div></TableCell>
								<TableCell align='center'><div>{data.currency}</div></TableCell>
								<TableCell align='center'><div>{data.amount.toLocaleString()}</div></TableCell>
								<TableCell align='center'><div>{data.isAvailable}</div></TableCell>
							</TableRow>
						</Link>
					)
				})}
			</TableBody>
		</Table>
	)
}
