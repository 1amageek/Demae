import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import firebase from 'firebase'
import 'firebase/functions'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Login from 'components/Login'

import { UserContext } from 'context'


export default () => {
	return (
		<UserContext.Consumer>
			{user => {
				if (user) {
					return (
						<>
							<Typography variant="h6" noWrap>
								利用規約
          		</Typography>
							<Link href="/providers/edit">
								<Button>お店を作成</Button>
							</Link>
						</>
					)
				} else {
					return <Login />
				}
			}}
		</UserContext.Consumer>
	)
}
