import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import { makeStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Check from '@material-ui/icons/Check';
import { Container, Grid, Button, Box, Typography, StepConnector, Table, TableBody, TableRow, TableCell, AppBar } from '@material-ui/core';
import Board from 'components/admin/Board'
import { Countries, Country } from 'common/Country';
import Select, { useSelect } from 'components/Select'
import { StepIconProps } from '@material-ui/core/StepIcon';
import AccountForm from 'components/account/workflow/Form'
import { Account } from 'models/account';
import Agreement from './agreement'
import Completed from './complete'
import RegisterableCountries from 'config/RegisterableCountries'

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

const Steps = ['Agreement', 'Create an account', 'Finish']

export default () => {
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const account = new Account()

	const country = useSelect({
		initValue: 'US',
		inputProps: {
			menu: Countries.filter(country => RegisterableCountries.includes(country.value))
		},
		controlProps: {
			variant: 'outlined'
		}
	})

	return (
		<Container maxWidth='md'>
			<Board header={
				<Box display='flex' flexGrow={1} alignItems='center' justifyContent='space-between'>
					<Box flexGrow={1}>Account</Box>
					<Box>
						<Select {...country} disabled={activeStep !== 0} />
					</Box>
				</Box>
			}>
				<Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
					{Steps.map((label) => (
						<Step key={label}>
							<StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
						</Step>
					))}
				</Stepper>

				{activeStep === 0 && <Agreement country={country.value as Country} onCallback={handleNext} />}
				{activeStep === 1 && <AccountForm country={country.value as Country} onCallback={(next) => {
					if (next) {
						handleNext()
					} else {
						handleBack()
					}
				}} />}
				{activeStep === 2 && <Completed account={account} />}

			</Board>
		</Container>

	)
}
