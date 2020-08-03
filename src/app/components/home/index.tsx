import React from 'react';
import { Container } from '@material-ui/core'
import ProviderList from 'components/providers/ProviderList';
export default () => {
	return (
		<Container maxWidth='sm'>
			<ProviderList />
		</Container>
	)
}
