import { Container } from '@material-ui/core'
import ProviderList from 'components/providers/ProviderList'
import Provider from 'components/providers/Provider'

export default (props: any) => {
	const { providerID } = props.match.params
	if (providerID) {
		return (
			<Container maxWidth='sm'>
				<Provider />
			</Container>
		)
	}
	return (
		<Container maxWidth='sm'>
			<ProviderList />
		</Container>
	)
}
