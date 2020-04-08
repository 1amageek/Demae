import React from 'react';
import Link from 'next/link'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import StatusCell from 'components/admin/StatusCell';

export default ({ product, skus }: { product: Product, skus: SKU[] }) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell align='left'>ID</TableCell>
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
						<Link href={`/admin/products/${product.id}/skus/${data.id}`} key={data.id} >
							<TableRow hover key={data.id}>
								<TableCell align='left'><div>{data.id}</div></TableCell>
								<TableCell align='left'><div>{data.name}</div></TableCell>
								<TableCell align='left'><div>{data.currency}</div></TableCell>
								<TableCell align='left'><div>{data.amount.toLocaleString()}</div></TableCell>
								<StatusCell isAvalabled={data.isAvailable} onChangeStatus={() => { }} />
							</TableRow>
						</Link>
					)
				})}
			</TableBody>
		</Table>
	)
}
