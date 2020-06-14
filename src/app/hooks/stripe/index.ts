import { useEffect, useState } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { PaymentMethod } from '@stripe/stripe-js';

export const usePaymentMethods = (): [PaymentMethod[], boolean, Error | undefined] => {
	const [data, isLoading, error] = useFunctions<any>('stripe-v1-paymentMethod-list', { type: 'card' })
	const methods = data?.data as PaymentMethod[]
	return [methods, isLoading, error]
}

export const useFunctions = <T>(query: string, option: any = {}, waiting: boolean = false): [T | undefined, boolean, Error | undefined, (data: T) => void] => {

	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}

	const [state, setState] = useState<Prop>({ data: undefined, loading: true })

	const setData = (data: T) => {
		setState({
			error: undefined,
			loading: false,
			data: data
		});
	}

	useEffect(() => {
		let enabled = true
		const fetchData = async () => {
			try {
				const call = await firebase.functions().httpsCallable(query)
				const response = await call(option)
				const { result, error } = response.data
				if (enabled) {
					if (error) {
						setState({
							error: error,
							loading: false,
							data: undefined
						});
					} else {
						setState({
							error: undefined,
							loading: false,
							data: result
						});
					}
				}
			} catch (error) {
				console.log(error)
				if (enabled) {
					setState({
						data: undefined,
						loading: false,
						error
					});
				}
			}
		};
		setState({
			data: undefined,
			loading: true,
			error: undefined
		})
		if (!waiting) {
			fetchData()
		}
		return () => {
			enabled = false
		}
	}, [waiting])
	return [state.data, state.loading, state.error, setData]
};

export const useFetchList = <T>(query: string, option: any = {}, waiting: boolean = false): [T[], boolean, Error | undefined, (data: T[]) => void] => {
	const [data, isLoading, error] = useFunctions<any>(query, option, waiting)
	const [list, setList] = useState<T[]>(data?.data || [] as T[])
	const setData = (data: T[]) => setList(data)
	useEffect(() => {
		setData(data?.data || [] as T[])
	}, [data?.data.length])
	return [list, isLoading, error, setData]
}
