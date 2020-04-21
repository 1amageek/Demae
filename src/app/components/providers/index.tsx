import ProviderList from 'components/providers/ProviderList'
import Provider from 'components/providers/Provider'

export default (props: any) => {
	const { providerID, productID, skuID } = props.match.params
	if (providerID) {
		return <Provider providerID={providerID} />
	}
	return <ProviderList />
}
