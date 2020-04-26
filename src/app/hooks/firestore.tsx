import { useEffect, useState } from 'react'
import firebase from "firebase"
import "firebase/firestore"
import "firebase/auth"
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
					if (snapshot.exists) {
						const data = type.fromSnapshot<T>(snapshot)
						if (enabled) {
							setState({
								data: data,
								loading: false,
								error: undefined
							})
						}
					} else {
						if (enabled) {
							setState({
								data: undefined,
								loading: false,
								error: undefined
							})
						}
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
				if (enabled) {
					if (!state.loading) {
						setState({
							data: undefined,
							loading: true,
							error: undefined
						})
					}
				}
				listen(documentReference)
			} else {
				if (enabled) {
					setState({
						data: undefined,
						loading: false,
						error: undefined
					})
				}
			}
		} else {
			if (enabled) {
				setState({
					data: undefined,
					loading: waiting,
					error: undefined
				})
			}
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

export const Where = (fieldPath: string | firebase.firestore.FieldPath,
	opStr: firebase.firestore.WhereFilterOp,
	value: any) => {
	return { fieldPath, opStr, value }
}

export const OrderBy = (fieldPath: string | firebase.firestore.FieldPath,
	directionStr?: firebase.firestore.OrderByDirection) => {
	return { fieldPath, directionStr }
}

export interface Query {
	path?: string
	wheres?: {
		fieldPath: string | firebase.firestore.FieldPath,
		opStr: firebase.firestore.WhereFilterOp,
		value: any
	}[]
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
	let ref: firebase.firestore.Query | undefined = (query && query.path) ? firestore.collection(query.path) : undefined

	if (query?.wheres) {
		query.wheres.forEach(where => {
			const { fieldPath, opStr, value } = where
			ref = ref?.where(fieldPath, opStr, value)
		})
	}

	if (query?.orderBy) {
		const { fieldPath, directionStr } = query.orderBy
		ref = ref?.orderBy(fieldPath, directionStr)
	}

	if (query?.limit) {
		ref = ref?.limit(query.limit)
	}

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
	}, [query?.path, JSON.stringify(query?.wheres), query?.orderBy, query?.limit, waiting])
	return [state.data, state.loading, state.error]
};
