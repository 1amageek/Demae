import React, { useState } from 'react';
import { MenuProps } from '@material-ui/core/Menu';

export const useMenu = (): [MenuProps, (event: React.MouseEvent<HTMLButtonElement>) => void, () => void] => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const props: MenuProps = {
		anchorEl: anchorEl,
		keepMounted: true,
		open: Boolean(anchorEl),
		onClose: handleClose
	}

	return [props, handleOpen, handleClose]
}
