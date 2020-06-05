import { useLocation } from 'react-router-dom'

export const useURL = () => {
	const { search } = useLocation()
	const params = new URLSearchParams(search);
	const mediatedby = params.get('mediatedby');

	const useURL = (baseURL: string) => {
		return urlWithQuery(baseURL, { mediatedby: mediatedby })
	}

	return useURL
}

type Params = {
	[query: string]: string | null
}

const urlWithQuery = (baseURL: string, params: Params) => {
	Object.keys(params).filter((key) => (params[key] == null) && delete params[key]);
	return baseURL + '?' + Object.entries(params).map((e) => `${e[0]}=${e[1]}`).join('&');
}
