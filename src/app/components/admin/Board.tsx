import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Tooltip, IconButton, Box } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


export default ({ header, hideBackArrow, link, onClick, children }: { header?: React.ReactNode, hideBackArrow?: boolean, link?: string, onClick?: (e) => void, children: any }) => {
	const history = useHistory()
	return (
		<Paper style={{ minHeight: '400px' }} square >
			<AppBar position="static" color="default" elevation={0}>
				<Toolbar>
					{!(hideBackArrow || false) &&
						<Hidden mdUp>
							<Tooltip title='Back' onClick={(e) => {
								e.preventDefault()
								if (onClick) {
									onClick(e)
								} else {
									if (link) {
										history.push(link)
									} else {
										history.goBack()
									}
								}
							}}>
								<IconButton>
									<ArrowBackIcon color='inherit' />
								</IconButton>
							</Tooltip>
						</Hidden>
					}
					<Box display="flex" flexGrow={1} fontSize={17} fontWeight={500} justifyContent='start' alignItems='center'>
						{header}
					</Box>
				</Toolbar>
			</AppBar>
			{children}
		</Paper>
	)
}
