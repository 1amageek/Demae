
import React, { useState } from 'react'
import Link from 'next/link'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import Product from 'models/commerce/Product'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		box: {
			backgroundColor: '#fafafa'
		},
		bottomBox: {
			padding: theme.spacing(1),
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
	}),
);

export default ({ edit, product }: { edit: boolean, product: Product }) => {
	const classes = useStyles()

	const [isEditing, setEditing] = useState(edit)
	const name = useInput(product?.name)
	const caption = useInput(product?.caption)
	const description = useInput(product?.description)
	const isAvailable = useSelect({
		initValue: product?.isAvailable || 'true',
		inputProps: {
			menu: [
				{
					label: 'Available',
					value: 'true'
				},
				{
					label: 'Unavailable',
					value: 'false'
				}
			]
		}
	})

	if (isEditing) {
		return (
			<>
				<AppBar position='static' color='transparent' elevation={0}>
					<Toolbar>
						<Typography variant='h6'>
							Edit Product
          	</Typography>
					</Toolbar>
				</AppBar>
				<Box className={classes.box} >
					<Table>
						<TableBody>
							<TableRow>
								<TableCell align='right'><div>ID</div></TableCell>
								<TableCell align='left'><div>{product.id}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>name</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...name} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>caption</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...caption} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>description</div></TableCell>
								<TableCell align='left'>
									<div>
										<Input variant='outlined' margin='dense' {...description} />
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>Status</div></TableCell>
								<TableCell align='left'>
									<div>
										<Select fullWidth {...isAvailable} />
									</div>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Toolbar>
						<Grid container spacing={2} alignItems='center'>
							<Grid item>
								<Button variant='outlined' onClick={() => {
									setEditing(false)
								}}>CANCEL</Button>
							</Grid>
							<Grid item>
								<Button variant='contained' color='primary' onClick={async () => {
									if (product) {
										product.name = name.value
										product.caption = caption.value
										product.description = description.value
										product.isAvailable = isAvailable.value === 'true'
										await product.save()
									}
									setEditing(false)
								}}>SAVE</Button>
							</Grid>
						</Grid>
					</Toolbar>
				</Box>
			</>
		)
	} else {
		if (!product) {
			return <></>
		}
		return (
			<>
				<AppBar position='static' color='transparent' elevation={0}>
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
								<Typography variant='h6'>
									Product
          			</Typography>
							</Grid>
						</Grid>
					</Toolbar>
				</AppBar>
				<Box className={classes.box} >
					<Table>
						<TableBody>
							<TableRow>
								<TableCell align='right'><div>ID</div></TableCell>
								<TableCell align='left'><div>{product.id}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>name</div></TableCell>
								<TableCell align='left'><div>{product.name}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>caption</div></TableCell>
								<TableCell align='left'><div>{product.caption}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>description</div></TableCell>
								<TableCell align='left'><div>{product.description}</div></TableCell>
							</TableRow>
							<TableRow>
								<TableCell align='right'><div>Status</div></TableCell>
								<TableCell align='left'><div>{product.isAvailable ? 'Available' : 'Disabled'}</div></TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Box>
				<Box className={classes.bottomBox} >
					<Toolbar>
						<Button variant='contained' color='primary' onClick={() => {
							setEditing(true)
						}}>EDIT</Button>
					</Toolbar>
				</Box>
			</>
		)
	}
}
