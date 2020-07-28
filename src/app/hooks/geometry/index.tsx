import React, { useRef, useState, useEffect } from "react"

export const useWidth = <T extends HTMLElement>(): [React.RefObject<T>, number] => {
	const ref = useRef<T>(null)
	const [width, setWidth] = useState(0)
	useEffect(() => {
		if (ref.current) {
			const { width } = ref.current.getBoundingClientRect()
			setWidth(width)
		}
	}, [ref.current])
	return [ref, width]
}

export const useHeight = <T extends HTMLElement>(): [React.RefObject<T>, number] => {
	const ref = useRef<T>(null)
	const [height, setHeight] = useState(0)
	useEffect(() => {
		if (ref.current) {
			const { height } = ref.current.getBoundingClientRect()
			setHeight(height)
		}
	}, [ref.current])
	return [ref, height]
}
