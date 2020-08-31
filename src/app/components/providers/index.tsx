import { Container } from "@material-ui/core"
import { useParams } from "react-router-dom"
import ProviderList from "components/providers/ProviderList"
import Provider from "components/providers/Provider"

export default () => {
	const { providerID } = useParams<{ providerID?: string }>()
	if (providerID) {
		return (
			<Container maxWidth="sm" disableGutters>
				<Provider />
			</Container>
		)
	}
	return (
		<Container maxWidth="sm" >
			<ProviderList />
		</Container>
	)
}
