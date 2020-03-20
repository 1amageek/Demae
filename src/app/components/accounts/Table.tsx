import React, { useState, forwardRef } from 'react';
import MaterialTable, { Column } from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
	Add: forwardRef((props, ref) => <AddBox {...props} ref={ref as any} />),
	Check: forwardRef((props, ref) => <Check {...props} ref={ref as any} />),
	Clear: forwardRef((props, ref) => <Clear {...props} ref={ref as any} />),
	Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref as any} />),
	DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref as any} />),
	Edit: forwardRef((props, ref) => <Edit {...props} ref={ref as any} />),
	Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref as any} />),
	Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref as any} />),
	FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref as any} />),
	LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref as any} />),
	NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref as any} />),
	PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref as any} />),
	ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref as any} />),
	Search: forwardRef((props, ref) => <Search {...props} ref={ref as any} />),
	SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref as any} />),
	ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref as any} />),
	ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref as any} />)
};

interface Row {
	name: string;
	caption: string;
	description: string;
	status: boolean;
}

interface TableState {
	columns: Array<Column<Row>>;
	data: Row[];
}

export default () => {
	const [state, setState] = useState<TableState>({
		columns: [
			{ title: 'Name', field: 'name' },
			{ title: 'Caption', field: 'caption' },
			{ title: 'Description', field: 'description' },
			{ title: 'Status', field: 'status' }
		],
		data: [
			{ name: 'Mehmet', caption: 'Baran', description: "1987", status: true },
		],
	});

	return (
		<MaterialTable
			options={{
				search: false,
				showTitle: false,
				toolbar: false,
			}}
			columns={state.columns}
			data={state.data}
			editable={{
				onRowAdd: newData =>
					new Promise(resolve => {
						setTimeout(() => {
							resolve();
							setState(prevState => {
								const data = [...prevState.data];
								data.push(newData);
								return { ...prevState, data };
							});
						}, 600);
					}),
				onRowUpdate: (newData, oldData) =>
					new Promise(resolve => {
						setTimeout(() => {
							resolve();
							if (oldData) {
								setState(prevState => {
									const data = [...prevState.data];
									data[data.indexOf(oldData)] = newData;
									return { ...prevState, data };
								});
							}
						}, 600);
					}),
				onRowDelete: oldData =>
					new Promise(resolve => {
						setTimeout(() => {
							resolve();
							setState(prevState => {
								const data = [...prevState.data];
								data.splice(data.indexOf(oldData), 1);
								return { ...prevState, data };
							});
						}, 600);
					}),
			}}
		/>
	);
}
