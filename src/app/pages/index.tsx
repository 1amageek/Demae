import React from 'react'
import App from 'components/App'

import Worker from "worker-loader!../workers/index.worker"


let worker: Worker

export default () => {
	React.useEffect(() => {
		worker = new Worker()
		worker.postMessage('message')
		console.log("meees")
		return () => worker.terminate()
	}, [])
	return <App />
}
