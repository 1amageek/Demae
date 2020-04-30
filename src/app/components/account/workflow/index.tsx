import React, { useState } from 'react';
import { makeStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Check from '@material-ui/icons/Check';
import Toolbar from '@material-ui/core/Toolbar';
import { Container, Grid, Button, Box, Typography, StepConnector } from '@material-ui/core';
import Board from 'components/admin/Board'
import { useAdminProvider } from 'hooks/commerce';
import { useProcessing } from 'components/Processing';
import { useSnackbar } from 'components/Snackbar';
import DataLoading from 'components/DataLoading';
import { StepIconProps } from '@material-ui/core/StepIcon';
import TOS from 'config/TOS';
import AccountForm from 'components/admin/account/Form/US'

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

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			width: '100%',
		},
		button: {
			marginRight: theme.spacing(1),
		},
		instructions: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	}),
);

const Steps = ['Agreement', 'Create an account', 'Confirm']

function getStepContent(step: number) {
	switch (step) {
		case 0:
			return 'Do you agree with the terms of use?';
		case 1:
			return 'What is an ad group anyways?';
		case 2:
			return 'This is the bit I really care about!';
		default:
			return 'Unknown step';
	}
}

export default () => {
	const classes = useStyles();
	const [activeStep, setActiveStep] = useState(1);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	return (
		<Container maxWidth='md'>
			<Board header={
				<Box>Account</Box>
			}>
				<Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
					{Steps.map((label) => (
						<Step key={label}>
							<StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
						</Step>
					))}
				</Stepper>

				{activeStep === 0 && <Agreement />}
				{activeStep === 1 && <AccountForm />}


				<Box padding={2}>
					{activeStep === Steps.length ? (
						<div>
							<Typography className={classes.instructions}>
								All steps completed - you&apos;re finished
            </Typography>
							<Button onClick={handleReset} className={classes.button}>
								Reset
            </Button>
						</div>
					) : (
							<div>
								<Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
								<div>
									<Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
										Back
              	</Button>
									<Button
										variant="contained"
										color="primary"
										onClick={handleNext}
										className={classes.button}
									>
										{activeStep === Steps.length - 1 ? 'Finish' : 'Next'}
									</Button>
								</div>
							</div>
						)}
				</Box>
			</Board>
		</Container>

	)
}


const Agreement = () => {
	const code = 'us'
	return (
		<Box padding={3}>
			{`Payment processing services for ${TOS[code].accountHolderTerm} on ${TOS[code].platformName} are provided by Stripe and are subject to the `}
			<a href='https://stripe.com/jp/connect-account/legal' target='_blank'>Stripe Connected Account Agreement</a>
			{`, which includes the `}
			<a href='' target='_blank'>Stripe Terms of Service</a>
			{` (collectively, the “Stripe Services Agreement”). By agreeing to ${TOS[code].terms} or continuing to operate as a ${TOS[code].accountHolderTerm} on ${TOS[code].platformName}, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of ${TOS[code].platformName} enabling payment processing services through Stripe, you agree to provide ${TOS[code].platformName} accurate and complete information about you and your business, and you authorize ${TOS[code].platformName} to share it and transaction information related to your use of the payment processing services provided by Stripe.`}
		</Box>
	)
}

