import React, { useState } from "react";
import { makeStyles, Theme, createStyles, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { Stepper, Step, StepLabel, FormControl } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import { Container, Box, Typography, StepConnector } from "@material-ui/core";
import Board from "components/admin/Board"
import { SupportedCountries, CountryCode } from "common/Country";
import Select, { useSelect, useMenu } from "components/_Select"
import Form from "./form"
import Completed from "./complete"

export default () => {

	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const [isCompleted, setComplete] = useState(false)
	const [country] = useSelect("US")

	return (
		<Container maxWidth="sm" disableGutters>
			<Box padding={2}>
				<Box padding={2}>
					<Typography variant="h1">{`Get started today.`}</Typography>
					<Typography variant="body1" gutterBottom>Begin taking customer orders in more places, online and in-store.</Typography>
				</Box>
				{isCompleted ? <Completed /> :
					<Form country={country.value as CountryCode} onCallback={(next) => {
						setComplete(true)
					}} />
				}
			</Box>
		</Container>
	)
}
