import { useRouter } from 'next/router'
import Layout from 'components/providers/Layout'
import Provider from 'components/providers/Provider'
import ProductList from 'components/providers/products/ProductList'

export default () => {
	const router = useRouter()
	const providerID = router.query.providerID as string
	return (
		<Layout>
			<Provider providerID={providerID} />
			<ProductList providerID={providerID} />
		</Layout>
	)
}
