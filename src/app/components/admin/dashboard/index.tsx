
import React, { useState } from 'react'
import firebase from 'firebase'
import { File as StorageFile } from '@1amageek/ballcap'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Input, { useInput } from 'components/Input'
import Select, { useSelect } from 'components/Select'
import DndCard from 'components/DndCard'
import Provider from 'models/commerce/Provider'
import Loading from 'components/Loading';
import Board from 'components/admin/Board'
import { useAdminProvider } from 'hooks/commerce';
import { useProcessing } from 'components/Processing';
import DataLoading from 'components/DataLoading';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

export default () => {

	return (
		<Board header={
			<Box fontSize={16} fontWeight={600}>Dashboard</Box>
		}>
			<Box flexGrow={1} padding={1} alignItems='center' justifyContent='center'>
				<OrderChart />
			</Box>
		</Board>
	)
}

const data = [
	{
		name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
	},
	{
		name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
	},
	{
		name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
	},
	{
		name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
	},
	{
		name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
	},
	{
		name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
	},
	{
		name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
	},
];

const OrderChart = () => {
	return (
		<LineChart
			width={500}
			height={300}
			data={data}
			margin={{
				top: 5, right: 30, left: 20, bottom: 5,
			}}
		>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="name" />
			<YAxis />
			<Tooltip />
			<Legend />
			<Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
			<Line type="monotone" dataKey="uv" stroke="#82ca9d" />
		</LineChart>
	);
}
