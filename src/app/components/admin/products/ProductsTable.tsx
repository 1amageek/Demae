import React from 'react';
import Link from 'next/link'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Product from 'models/commerce/Product'
import StatusCell from '../StatusCell';

export default ({ products }: { products: Product[] }) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell align='left'>ID</TableCell>
					<TableCell align='left'>Name</TableCell>
					<TableCell align='left'>Status</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{products.map(product => {
					return (
						<Link href={`/admin/products/${product.id}`} key={product.id} >
							<TableRow hover key={product.id}>
								<TableCell align='left'><div>{product.id}</div></TableCell>
								<TableCell align='left'><div>{product.name}</div></TableCell>
								<StatusCell isAvalabled={product.isAvailable} onChangeStatus={(isAvailable) => {
									console.log(isAvailable)
								}} />
							</TableRow>
						</Link>
					)
				})}
			</TableBody>
		</Table>
	)
}
