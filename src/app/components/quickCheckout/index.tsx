import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Stepper, StepLabel, Step, Button, Paper } from '@material-ui/core';
import Check from '@material-ui/icons/Check';
import { Container, Box, StepConnector, Slide } from '@material-ui/core';
import { StepIconProps } from '@material-ui/core/StepIcon';
import { Account } from 'models/account';
import { CartGroup, CartItem } from 'models/commerce/Cart'
import { SKU, Cart, Product } from 'models/commerce'
import Navigation, { usePush, usePop } from 'components/Navigation'
import Summary from './summary'

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

function QontoStepIcon(props: StepIconProps) {
	const classes = useQontoStepIconStyles();
	const { active, completed } = props;

	return (
		<div
			className={clsx(classes.root, {
				[classes.active]: active,
			})}
		>
			{completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
		</div>
	);
}

const Steps = ['Summary', 'Payment', 'Finish']

const newCart = (product: Product, sku: SKU) => {
	const cart = new Cart()
	cart.addSKU(product, sku)
	return cart
}

export default ({ product, sku }: { product: Product, sku: SKU }) => {

	const [cartData, setCart] = useState(newCart(product, sku).data())
	const cart = Cart.fromData<Cart>(cartData)
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	return (
		<Box>
			<Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
				{Steps.map((label) => (
					<Step key={label}>
						<StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<Navigation>
				{activeStep === 0 && <Summary cart={cart} setCart={setCart} onNext={handleNext} />}
			</Navigation>
		</Box>
	)
}

const Content = () => {
	const [push] = usePush()
	return (
		<>
			<Button onClick={() => {
				push(
					<Child />
					// () => {
					// 	const pop = usePop()
					// 	return (
					// 		<Paper>
					// 			<Content />
					// 			<Button onClick={() => {
					// 				pop()
					// 			}}>Pop</Button>
					// 		</Paper>
					// 	)
					// }
				)
			}}>Push</Button>
		</>
	)
}

const Child = () => {
	const pop = usePop()
	return (
		<Paper>
			<Content />
			<Button onClick={pop}>aaaa</Button>
		</Paper>
	)
}
