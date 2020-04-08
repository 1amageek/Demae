import ProviderList from 'components/providers/ProviderList'
import Provider from 'components/providers/Provider'

export default (props: any) => {
	const { providerID } = props.match.params
	if (providerID) {
		return <Provider providerID={providerID} />
	} else {
		return <ProviderList />
	}
}
