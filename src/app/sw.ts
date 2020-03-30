import { useState, useEffect } from 'react'

export const useServiceWorker = (path: string): Worker | undefined => {
	const [worker, setWorker] = useState()
	useEffect(() => {
		(async () => {
			const { default: Worker } = await import(`worker-loader?name=static/[hash].worker.js!./workers/${path}`);
			const worker = new Worker()
			setWorker(worker)
		})();
	}, [])
	return worker
}
