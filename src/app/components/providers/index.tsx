import { Container } from '@material-ui/core'
import { useParams } from 'react-router-dom'
import ProviderList from 'components/providers/ProviderList'
import Provider from 'components/providers/Provider'

export default (props: any) => {
	const { providerID, productID, skuID } = useParams()
	if (providerID) {
		return (
			<Container maxWidth='sm' disableGutters>
				<Provider providerID={providerID} />
			</Container>
		)
	}
	return (
		<Container maxWidth='sm'>
			<ProviderList />
		</Container>
	)
}
