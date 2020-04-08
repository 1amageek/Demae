import React from 'react';
import { Button, Menu, TableCell, MenuItem } from '@material-ui/core';

export default ({ isAvalabled, onChangeStatus }: { isAvalabled: boolean, onChangeStatus: (isAvalabled: boolean) => void }) => {
	if (!document) {
		throw new Error()
	}

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedIndex, setSelectedIndex] = React.useState(1);

	const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<TableCell align='right'>
			<Button variant='outlined' onClick={handleClickListItem}>{isAvalabled ? 'Avalabled' : 'Unavailable'}</Button>
			<Menu
				id="lock-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				{['Avalabled', 'Unavailable'].map((state, index) => (
					<MenuItem
						key={state}
						disabled={index === 0}
						selected={index === selectedIndex}
						onClick={async (_) => {
							setSelectedIndex(index);
							setAnchorEl(null);
							onChangeStatus(state === 'Avalabled')
						}}
					>
						{state.toUpperCase()}
					</MenuItem>
				))}
			</Menu>
		</TableCell>
	)
}
