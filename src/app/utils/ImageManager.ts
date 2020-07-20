import Config from "config/ImageConfig"

export interface ImageProps {
	/**
	 * Used in combination with `src` or `srcSet` to
	 * provide an alt attribute for the rendered `img` element.
	 */
	alt?: string;
	/**
	 * The `sizes` attribute for the `img` element.
	 */
	sizes?: string;
	/**
	 * The `src` attribute for the `img` element.
	 */
	src?: string;
	/**
	 * The `srcSet` attribute for the `img` element.
	 * Use this attribute for responsive image display.
	 */
	srcSet?: string;

	decoding?: string;
}

interface Props {
	path?: string
	alt?: string
	sizes?: string
	src?: string
	srcSet?: string
	decoding?: string
}

export const useImage = (props: Props): ImageProps => {
	const path = props.path
	if (!path) return { alt: props.alt }
	const alt = props.alt ?? ""
	const targetWidths = Config.targetWidths
	const sizes = props.sizes
	const src = props.src ? props.src : `${process.env.HOST}/assets/${path}`
	const srcSet = props.srcSet ? props.srcSet : targetWidths.map(width => `${process.env.HOST}/assets/w/${width}/${path} ${width}w`).join(",")
	const decoding = props.decoding ?? "auto"
	return { alt, decoding, sizes, srcSet, src }
}
