import React from "react"
import SegmentControl, { useSegmentControl } from "components/SegmentControl"

export default () => {
	const [segmentControl] = useSegmentControl(["TITLE", "TITLE", "TITLE"])
	return (
		<>
			<SegmentControl {...segmentControl} />
		</>
	)
}
