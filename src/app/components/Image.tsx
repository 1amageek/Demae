import React from "react"

interface Props {
	alt?: string
	srcSet?: string
	src?: string
}

export default (props: Props) => {

	const { alt, srcSet, src } = props

	return (
		<img alt={alt} srcSet={srcSet} src={src} style={{
			objectFit: "cover"
		}} />
	)
}
