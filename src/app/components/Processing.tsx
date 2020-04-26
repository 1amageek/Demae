import React, { createContext, useContext, useState } from 'react'
import { CircularProgress, Box } from '@material-ui/core'

const Processing = ({ isProcessing }: { isProcessing: boolean }) => {
	if (isProcessing) {
		return (
			<Box
				zIndex='tooltip'
				position='fixed'
				display='flex'
				justifyContent='center'
				alignItems='center'
				top={0}
				bottom={0}
				left={0}
				right={0}
				style={{
					background: 'rgba(0, 0, 0, 0.2)',
					// backdropFilter: 'blur(2px)'
				}}
			>
				<CircularProgress />
			</Box>
		)
	}
	return <></>
}

export const ProcessingContext = createContext<[(processing: boolean) => void, boolean]>([() => { }, false])
export const ProcessingProvider = ({ children }: { children: any }) => {
	const [isProcessing, setProcessing] = useState(false)
	return (
		<ProcessingContext.Provider value={[setProcessing, isProcessing]}>
			<Processing isProcessing={isProcessing} />
			{children}
		</ProcessingContext.Provider>
	)
}

export const useProcessing = () => {
	return useContext(ProcessingContext)
}
