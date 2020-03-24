import { useEffect, useState } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { PaymentMethod } from 'common/stripe'

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
