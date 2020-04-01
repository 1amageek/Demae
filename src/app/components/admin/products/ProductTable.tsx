
import React, { useState } from 'react'
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Product from 'models/commerce/Product'

export default ({ edit, product }: { edit: boolean, product: Product }) => {

	const [isEditing, setEditing] = useState(edit)

	const name = useInput(product?.name)
	const caption = useInput(product?.caption)
	const description = useInput(product?.description)
	const isAvailable = useSelect({
		initValue: product?.isAvailable,
		inputProps: {
			menu: [
				{
					label: 'Available',
					value: 1
				},
				{
					label: 'Unavailable',
					value: 0
				}
			]
		}
	})

	if (isEditing) {
		return (
			<>
				<AppBar position='static' color='default' elevation={0}>
					<Toolbar>
						<Grid container spacing={2} alignItems='center'>
							<Grid item>
								<Button variant='contained' onClick={() => {
									setEditing(false)
								}}>CANCEL</Button>
							</Grid>
							<Grid item>
								<Button variant='contained' color='primary' onClick={async () => {
									if (product) {
										product.name = name.value
										product.caption = caption.value
										product.description = description.value
										product.isAvailable = isAvailable.value as boolean
										await product.save()
									}
									setEditing(false)
								}}>SAVE</Button>
							</Grid>
						</Grid>
					</Toolbar>
				</AppBar>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell align='left' variant='head'><div>ID</div></TableCell>
							<TableCell align='left'><div>{product.id}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left' variant='head'><div>name</div></TableCell>
							<TableCell align='left'><div><Input fullWidth {...name} /></div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left' variant='head'><div>caption</div></TableCell>
							<TableCell align='left'><div><Input fullWidth {...caption} /></div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left' variant='head'><div>description</div></TableCell>
							<TableCell align='left'><div><Input fullWidth {...description} /></div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left' variant='head'><div>Status</div></TableCell>
							<TableCell align='left'><div><Select fullWidth {...isAvailable} /></div></TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</>
		)
	} else {
		if (!product) {
			return <></>
		}
		return (
			<>
				<AppBar position='static' color='default' elevation={0}>
					<Toolbar>
						<Grid container spacing={2} alignItems='center'>
							<Grid item>
								<Link href='/admin/products'>
									<Tooltip title='Back'>
										<IconButton>
											<ArrowBackIcon color='inherit' />
										</IconButton>
									</Tooltip>
								</Link>
							</Grid>
							<Grid item>
								<Button variant='contained' color='primary' onClick={() => {
									setEditing(true)
								}}>EDIT</Button>
							</Grid>
						</Grid>
					</Toolbar>
				</AppBar>
				<Table>
					<TableBody>
						<TableRow>
							<TableCell align='left'><div>ID</div></TableCell>
							<TableCell align='left'><div>{product.id}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left'><div>name</div></TableCell>
							<TableCell align='left'><div>{product.name}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left'><div>caption</div></TableCell>
							<TableCell align='left'><div>{product.caption}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left'><div>description</div></TableCell>
							<TableCell align='left'><div>{product.description}</div></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align='left'><div>Status</div></TableCell>
							<TableCell align='left'><div>{product.isAvailable ? 'Available' : 'Disabled'}</div></TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</>
		)
	}
}
