
import React from 'react'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { ListItemSecondaryAction, Switch } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ImageIcon from '@material-ui/icons/Image';
import { useAdminProviderProductSKUs, useAdminProvider } from 'hooks/commerce';
import DataLoading from 'components/DataLoading';
import Board from '../Board';
import { useHistory } from 'react-router-dom';
import { SKU } from 'models/commerce';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import { Symbol } from 'common/Currency'

export default ({ productID }: { productID?: string }) => {
	const [provider] = useAdminProvider()
	const [skus, isLoading] = useAdminProviderProductSKUs(productID)
	const history = useHistory()
	const [setProcessing] = useProcessing()
	const [setMessage] = useSnackbar()

	if (isLoading) {
		return (
			<Board header={
				<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500}>
					SKU
					<Box flexGrow={1} />
				</Box>
			}>
				<Box flexGrow={1} alignItems='center' justifyContent='center'>
					<DataLoading />
				</Box>
			</Board>
		)
	}

	return (
		<Board header={
			<Box display="flex" flexGrow={1} fontSize={20} fontWeight={500}>
				SKU
				<Box flexGrow={1} />
				<Button
					variant="contained"
					color="primary"
					size="small"
					disableElevation
					startIcon={
						<AddCircleIcon />
					}
					onClick={async () => {
						if (!provider) return
						if (!productID) return
						const sku = new SKU(provider.products.collectionReference.doc(productID).collection('skus').doc())
						sku.providedBy = provider.id
						sku.name = "No name"
						sku.isAvailable = false
						await sku.save()
						history.push(`/admin/products/${productID}/skus/${sku.id}`)
					}}
				>New</Button>
			</Box>
		}>
			<List>
				{skus.map(sku => {
					const price = sku.price
					const currency = sku.currency
					const symbol = Symbol(currency)
					return (
						<ListItem key={sku.id} button selected={productID === sku.id} onClick={() => {
							history.push(`/admin/products/${productID}/skus/${sku.id}`)
						}}>
							<ListItemAvatar>
								<Avatar variant="rounded" src={sku.imageURLs()[0]} >
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={sku.name} secondary={`${symbol}${price.toLocaleString()}`} />
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									onChange={async (e) => {
										e.preventDefault()
										setProcessing(true)
										if (!sku.isAvailable) {
											if (sku.inventory.type === 'finite') {
												const snapshot = await sku.stocks.collectionReference.get()
												const count = snapshot.docs.reduce((prev, current) => {
													return prev + current.data()!['count']
												}, 0)
												if (count <= 0) {
													setProcessing(false)
													setMessage('error', `To publish ${sku.name}, Add stock or change the inventory.`)
													return
												}
											}
										}
										sku.isAvailable = !sku.isAvailable
										await sku.save()
										setProcessing(false)
										setMessage('success', `${sku.name} is published`)
									}}
									checked={sku.isAvailable}
								/>
							</ListItemSecondaryAction>
						</ListItem>
					)
				})}
			</List>
		</Board>
	)
}

