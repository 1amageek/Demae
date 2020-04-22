import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Modal from 'components/Modal';
import Layout from 'components/admin/Layout'
import Form from 'components/admin/products/Form'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import { useAuthUser, useProvider } from 'hooks/commerce'
import Loading from 'components/Loading'


export default ({ header, children }: { header?: React.ReactNode, children: any }) => {
	return (
		<Paper style={{ minHeight: '400px' }} square >
			<AppBar position="static" color="default" elevation={0}>
				<Toolbar>
					{header}
				</Toolbar>
			</AppBar>
			{children}
		</Paper>
	)

}
