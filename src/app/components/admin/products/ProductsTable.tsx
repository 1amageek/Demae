import React from 'react';
import Link from 'next/link'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Product from 'models/commerce/Product'

export default ({ products }: { products: Product[] }) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell align='center'>ID</TableCell>
					<TableCell align='center'>Name</TableCell>
					<TableCell align='center'>Status</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{products.map(product => {
					return (
						<Link href={`/admin/products/${product.id}`} key={product.id} >
							<TableRow hover key={product.id}>
								<TableCell align='center'><div>{product.id}</div></TableCell>
								<TableCell align='center'><div>{product.name}</div></TableCell>
								<TableCell align='center'><div>{product.isAvailable}</div></TableCell>
							</TableRow>
						</Link>
					)
				})}
			</TableBody>
		</Table>
	)
}
