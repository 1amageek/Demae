import { useEffect, useState } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
import { PaymentMethod } from '@stripe/stripe-js';

export const usePaymentMethods = (): [PaymentMethod[], boolean] => {
	const [paymentMethods, setPaymentMethods] = useState<any[]>([])
	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			setLoading(true)
			const list = firebase.functions().httpsCallable('v1-stripe-paymentMethod-list')
			try {
				const result = await list({ type: 'card' })
				if (result.data) {
					setPaymentMethods(result.data.data)
				}
			} catch (error) {
				console.log(error)
			}
			setLoading(false)

		})()
	}, [paymentMethods.length])
	return [paymentMethods, isLoading]
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
				const list = await firebase.functions().httpsCallable(query)
				const result = await list(option)
				if (enabled) {
					const data = result.data.result
					if (data) {
						setState({
							error: undefined,
							loading: false,
							data: data
						});
					} else {
						setState({
							error: undefined,
							loading: false,
							data: undefined
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
