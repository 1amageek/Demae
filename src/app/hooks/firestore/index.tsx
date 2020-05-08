import React, { useEffect, useState, createContext, useContext } from 'react'
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

export interface WhereQuery {
	fieldPath: string | firebase.firestore.FieldPath
	opStr: firebase.firestore.WhereFilterOp
	value: any
}

export interface OrderByQuery {
	fieldPath: string | firebase.firestore.FieldPath,
	directionStr?: firebase.firestore.OrderByDirection
}

export const Where = (fieldPath: string | firebase.firestore.FieldPath,
	opStr: firebase.firestore.WhereFilterOp,
	value: any): WhereQuery => {
	return { fieldPath, opStr, value }
}

export const OrderBy = (fieldPath: string | firebase.firestore.FieldPath,
	directionStr?: firebase.firestore.OrderByDirection): OrderByQuery => {
	return { fieldPath, directionStr }
}

export interface Query {
	path?: string
	wheres?: Array<WhereQuery | undefined>
	orderBy?: OrderByQuery
	limit?: number
	startAfter?: firebase.firestore.DocumentSnapshot<any>
	endBefore?: firebase.firestore.DocumentSnapshot<any>
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
			if (where) {
				const { fieldPath, opStr, value } = where
				ref = ref?.where(fieldPath, opStr, value)
			}
		})
	}

	if (query?.orderBy) {
		const { fieldPath, directionStr } = query.orderBy
		ref = ref?.orderBy(fieldPath, directionStr)
	}

	if (query?.startAfter) {
		ref = ref?.startAfter(query.startAfter)
	}

	if (query?.endBefore) {
		ref = ref?.endBefore(query.endBefore)
	}

	if (query?.limit) {
		ref = ref?.limit(query.limit)
	}

	useEffect(() => {
		let enabled = true
		let listener: (() => void) | undefined
		const listen = async () => {
			listener = ref?.onSnapshot({
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
					console.error(error)
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
	}, [query?.path, JSON.stringify(query?.wheres), JSON.stringify(query?.orderBy), query?.limit, waiting])
	return [state.data, state.loading, state.error]
};


export const QueryContext = createContext<[Query, React.Dispatch<React.SetStateAction<Query>>]>([{}, () => { }])
export const QueryProvider = ({ children }: { children: any }) => {
	const [query, setQuery] = useState<Query>({})
	return <QueryContext.Provider value={[query, setQuery]}> {children} </QueryContext.Provider>
}

export const useQuery = (init?: Query): [Query, React.Dispatch<React.SetStateAction<Query>>] => {
	const [query, setQuery] = useContext(QueryContext)
	useEffect(() => {
		if (init) {
			setQuery(init)
		}
	}, [])
	return [query, setQuery]
}
