import React, { useState, useEffect } from 'react'
import firebase from "firebase"
import { Doc, CollectionReference, Query } from '@1amageek/ballcap'



export default class DataSource<T extends Doc> {

	reference!: CollectionReference
	query!: Query
	// where?: WhereQuery,
	// orderBy?: string,
	// direction?: firebase.firestore.OrderByDirection,
	// limit: number = 30
	// startAfter?: string,
	// endBefore?: string

	private state!: { data: T[], loading: boolean, error?: Error }
	private setState!: React.Dispatch<React.SetStateAction<{ data: T[], loading: boolean, error?: Error }>>
	private _limitState = useState<number | undefined>()

	constructor() {
		const [state, setState] = useState<{ data: T[], loading: boolean, error?: Error }>({ data: [], loading: false })
		this.state = state
		this.setState = setState
	}

	static ref(reference: CollectionReference) {
		const self = new this()
		self.reference = reference
		self.query = reference
		return self
	}

	limit(limit: number) {
		this._limitState[1](limit)
		this.query = this.query.limit(limit)
		return this
	}

	get(type: typeof Doc) {
		useEffect(() => {
			let enabled = true;
			const fetchData = async () => {
				try {
					const snapshot = await this.query.get()
					const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
					if (enabled) {
						this.setState({
							...this.state,
							loading: false,
							data
						});
					}
				} catch (error) {
					if (enabled) {
						this.setState({
							...this.state,
							loading: false,
							error
						});
					}
				}
			};
			this.setState({
				...this.state,
				loading: true
			});
			fetchData();
			return () => {
				enabled = false
			}
		}, []);
		return this
	}

	map<U extends Doc>(callbackfn: (doc: T) => Promise<U | undefined>) {
		interface Prop {
			data: U[]
			loading: boolean
			error?: Error
		}
		const [state, setState] = useState<Prop>({ data: [], loading: true })
		useEffect(() => {
			let enabled = true
			const fetchData = async (documents: T[]) => {
				try {
					const tasks = documents.map(doc => {
						return callbackfn(doc)
					})
					const docs = await Promise.all(tasks)
					const data = docs.filter(value => !!value) as U[]
					if (enabled) {
						setState({
							...state,
							loading: false,
							data
						});
					}
				} catch (error) {
					if (enabled) {
						setState({
							...state,
							loading: false,
							error
						});
					}
				}
			};
			setState({
				...state,
				loading: true
			})
			if (this.data.length > 0) {
				fetchData(this.data as unknown as T[])
			} else {
				setState({
					...state,
					loading: false
				})
			}
			return () => {
				enabled = false
			}
		}, [this.state.loading])
		return state
	}

	data() {
		return this.state
	}
}
