import Config from "config/ImageConfig"

interface ImageProps {
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
	const targetSizes = Config.targetSizes
	const sizes = props.sizes
	const src = props.src ? props.src : `${process.env.HOST}/assets/${path}`
	const srcSet = props.srcSet ? props.srcSet : targetSizes.map(size => `${process.env.HOST}/assets/w/${size}/${path} ${size}w`).join(",")
	const decoding = props.decoding ?? "auto"
	return { alt, decoding, sizes, srcSet, src }
}
