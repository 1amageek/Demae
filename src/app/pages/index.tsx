import React from 'react'
import App from 'components/App'
import firebase from 'firebase'

const register = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
			.then((reg) => {
				// Registration worked.
				console.log('Registration succeeded. Scope is ' + reg.scope);
			}).catch((error) => {
				// Registration failed.
				console.log(error)
				console.log('Registration failed with ' + error.message);
			});
	} else {
		window.location.assign('/unsupported');
	}
}

const index = ({ uid }: { uid?: string }) => {

	// const worker = useServiceWorker('index.worker')
	console.log('uid', uid)
	React.useEffect(() => {
		// register()
		// worker?.postMessage('from Host')
		// worker?.addEventListener('message', (event) => {
		// 	console.log("aeee", event)
		// })
	}, [])
	return <App>
		index
	</App>
}

function getId(req) {
	const uidHeader = req.headers.uid || '';
	const components = uidHeader.split(' ');
	return components.length > 1 ? components[1] : '';
}

index.getInitialProps = async (ctx) => {

	const { req, res }: { req: Request, res: Response } = ctx
	const uid = (req.headers as any).uid || ''
	return { uid }
}

export default index

