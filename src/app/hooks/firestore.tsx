import React, { useEffect, useState, createContext, useContext } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { firestore, Doc, DocumentReference } from '@1amageek/ballcap'

export const useDocumentListen = <T extends Doc>(type: typeof Doc, documentReference?: DocumentReference, waiting: boolean = false): [T | undefined, boolean, Error?] => {
	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		let listener: (() => void) | undefined
		const listen = async (documentReference: DocumentReference) => {
			listener = documentReference.onSnapshot({
				next: (snapshot) => {
					const data = type.fromSnapshot<T>(snapshot)
					if (enabled) {
						setState({
							data,
							loading: false,
							error: undefined
						})
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							data: undefined,
							loading: false,
							error
						})
					}
				}
			})
		}
		if (!waiting) {
			if (documentReference) {
				listen(documentReference)
			} else {
				setState({
					data: undefined,
					loading: false,
					error: undefined
				})
			}
		} else {
			setState({
				data: undefined,
				loading: waiting,
				error: undefined
			})
		}
		return () => {
			enabled = false
			if (listener) {
				listener()
			}
		}
	}, [documentReference?.path, waiting])
	return [state.data, state.loading, state.error]
}

export interface Query {
	path?: string
	where?: {
		fieldPath: string | firebase.firestore.FieldPath,
		opStr: firebase.firestore.WhereFilterOp,
		value: any
	}
	orderBy?: {
		fieldPath: string | firebase.firestore.FieldPath,
		directionStr?: firebase.firestore.OrderByDirection
	}
	limit?: number
}

export const useDataSourceListen = <T extends Doc>(type: typeof Doc, query?: Query, waiting: boolean = false): [T[], boolean, Error | undefined] => {
	interface Prop {
		data: T[]
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ data: [], loading: true })
	const ref = (query && query.path) ? firestore.collection(query.path) : undefined

	useEffect(() => {
		let enabled = true
		let listener: (() => void) | undefined
		const listen = async () => {
			ref?.onSnapshot({
				next: (snapshot) => {
					const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
					if (enabled) {
						setState({
							data,
							loading: false,
							error: undefined
						});
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							data: [],
							loading: false,
							error
						})
					}
				}
			})
		};

		if (!waiting) {
			if (ref) {
				listen()
			} else {
				setState({
					data: [],
					loading: false,
					error: undefined
				})
			}
		} else {
			setState({
				data: [],
				loading: waiting,
				error: undefined
			})
		}
		return () => {
			enabled = false
			if (listener) {
				listener()
			}
		}
	}, [query?.path, waiting])
	return [state.data, state.loading, state.error]
};
