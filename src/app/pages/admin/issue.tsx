import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Input, { useInput } from 'components/Input'
import Product from 'models/commerce/Product'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			'& > *': {
				margin: theme.spacing(1),
				width: 200,
			},
		},
	}),
);

export default () => {
	const classes = useStyles();

	// TODO: validation
	// TODO: button disabled
	const [name, setName] = useState(product.name)
	const [caption, setCaption] = useState(product.caption)
	const [description, setDescription] = useState(product.description)
	const [isAvailable, setAvailable] = useState(product.isAvailable)
	const [disabled, setDisabled] = useState(false)

	const onSubmit = async () => {
		product.name = name
		product.caption = caption
		product.description = description
		try {
			await product.save()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<form className={classes.root} noValidate autoComplete="off" onSubmit={onSubmit}>
			<FormControl>
				<TextField required id="name" label="Name" fullWidth />
				<TextField id="caption" label="caption" fullWidth />
				<TextField id="description" label="description" fullWidth />
				<FormControlLabel
					control={<Switch checked={isAvailable} onChange={() => { setAvailable(!isAvailable) }} name="checkedA" />}
					label="Available"
				/>
			</FormControl>
			<Button variant="contained" color="primary" onClick={onSubmit} disabled={disabled}>
				Save
			</Button>
		</form>
	);
}
