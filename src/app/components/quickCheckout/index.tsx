import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Stepper, StepLabel, Step, Button, Paper } from '@material-ui/core';
import Check from '@material-ui/icons/Check';
import { Container, Box, StepConnector, Slide } from '@material-ui/core';
import { StepIconProps } from '@material-ui/core/StepIcon';
import { SKU, Cart, Product } from 'models/commerce'
import Navigation, { usePush, usePop } from 'components/Navigation'
import Summary from './Summary'

const QontoConnector = withStyles({
	alternativeLabel: {
		top: 10,
		left: 'calc(-50% + 16px)',
		right: 'calc(50% + 16px)',
	},
	active: {
		'& $line': {
			borderColor: '#784af4',
		},
	},
	completed: {
		'& $line': {
			borderColor: '#784af4',
		},
	},
	line: {
		borderColor: '#eaeaf0',
		borderTopWidth: 3,
		borderRadius: 1,
	},
})(StepConnector);

const useQontoStepIconStyles = makeStyles({
	root: {
		color: '#eaeaf0',
		display: 'flex',
		height: 22,
		alignItems: 'center',
	},
	active: {
		color: '#784af4',
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: '50%',
		backgroundColor: 'currentColor',
	},
	completed: {
		color: '#784af4',
		zIndex: 1,
		fontSize: 18,
	},
});

const newCart = (product: Product, sku: SKU) => {
	const cart = new Cart()
	// cart.addSKU(product, sku)
	return cart
}

export default ({ product, sku }: { product: Product, sku: SKU }) => {

	const [cartData, setCart] = useState(newCart(product, sku).data())
	const cart = Cart.fromData<Cart>(cartData)

	return (
		<Box>
			<Navigation>
				<Summary cart={cart} providerID={product.providedBy} setCart={setCart} onNext={() => {

				}} />
			</Navigation>
		</Box>
	)
}
