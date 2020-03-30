export default {}
import firebase, { app } from "firebase"
import "@firebase/firestore"
import "@firebase/auth"

const config = require(`../config/${process.env.FIREBASE_CONFIG!}`)
const isEmulated = process.env.EMULATE_ENV === "emulator"
if (firebase.apps.length === 0) {
	const app = firebase.initializeApp(config)
	const firestore = app.firestore()
	if (isEmulated) {
		console.log("[APP] run emulator...")
		firestore.settings({
			host: "localhost:8080",
			ssl: false
		});
	}
}

const CACHE_NAME = 'cache-v1';
const urlsToCache = [
	// '/',
	// '/manifest.json',
	// '/config.js',
	// '/script.js',
	// '/common.js',
	// '/style.css'
];


firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		console.log('user signed in', user.uid);
	} else {
		console.log('user signed out');
	}
});

const getIdToken = () => {
	return new Promise((resolve, reject) => {
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			unsubscribe();
			if (user) {
				user.getIdToken().then((idToken) => {
					resolve(idToken);
				}, (error) => {
					resolve(null);
				});
			} else {
				resolve(null);
			}
		});
	}).catch((error) => {
		console.log(error);
	});
};

const getOriginFromUrl = (url) => {
	// https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
	const pathArray = url.split('/');
	const protocol = pathArray[0];
	const host = pathArray[2];
	return protocol + '//' + host;
};

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => console.log('Worker received:', event.data))
ctx.postMessage('from Worker')

ctx.addEventListener('install', (event) => {
	console.log('install')
	// Perform install steps.
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
		// Add all URLs of resources we want to cache.
		return cache.addAll(urlsToCache)
			.catch((error) => {
				// Suppress error as some of the files may not be available for the
				// current page.
			});
	}));
});

ctx.addEventListener('activate', (event) => {
	console.log('activate')
	// Update this list with all caches that need to remain cached.
	const cacheWhitelist = ['cache-v1'];
	event.waitUntil(caches.keys().then((cacheNames) => {
		return Promise.all(cacheNames.map((cacheName) => {
			// Check if cache is not whitelisted above.
			if (cacheWhitelist.indexOf(cacheName) === -1) {
				// If not whitelisted, delete it.
				return caches.delete(cacheName);
			}
			// Allow active service worker to set itself as the controller for all clients
			// within its scope. Otherwise, pages won't be able to use it until the next
			// load. This makes it possible for the login page to immediately use this.
		})).then(() => {
			// clients.claim()
		});
	}));
});

self.addEventListener('fetch', (event) => {
	const fetchEvent = event;
	console.log("eee", fetchEvent)
	return
	// Get underlying body if available. Works for text and json bodies.
	const getBodyContent = (req) => {
		return Promise.resolve().then(() => {
			if (req.method !== 'GET') {
				if (req.headers.get('Content-Type').indexOf('json') !== -1) {
					return req.json()
						.then((json) => {
							return JSON.stringify(json);
						});
				} else {
					return req.text();
				}
			}
		}).catch((error) => {
			// Ignore error.
		});
	};
	const requestProcessor = (idToken) => {
		let req = event.request;
		let processRequestPromise = Promise.resolve();
		// For same origin https requests, append idToken to header.
		if (self.location.origin == getOriginFromUrl(event.request.url) &&
			(self.location.protocol == 'https:' ||
				self.location.hostname == 'localhost') &&
			idToken) {
			// Clone headers as request headers are immutable.
			const headers = new Headers();
			for (let entry of req.headers.entries()) {
				headers.append(entry[0], entry[1]);
			}
			// Add ID token to header. We can't add to Authentication header as it
			// will break HTTP basic authentication.
			headers.append('Authorization', 'Bearer ' + idToken);
			processRequestPromise = getBodyContent(req).then((body) => {
				try {
					req = new Request(req.url, {
						method: req.method,
						headers: headers,
						mode: 'same-origin',
						credentials: req.credentials,
						cache: req.cache,
						redirect: req.redirect,
						referrer: req.referrer,
						body,
						bodyUsed: req.bodyUsed,
						context: req.context
					} as any);
				} catch (e) {
					// This will fail for CORS requests. We just continue with the
					// fetch caching logic below and do not pass the ID token.
				}
			});
		}
		return processRequestPromise.then(() => {
			return fetch(req);
		})
			.then((response) => {
				// Check if we received a valid response.
				// If not, just funnel the error response.
				if (!response || response.status !== 200 || response.type !== 'basic') {
					return response;
				}
				// If response is valid, clone it and save it to the cache.
				const responseToCache = response.clone();
				// Save response to cache only for GET requests.
				// Cache Storage API does not support using a Request object whose method is
				// not 'GET'.
				if (req.method === 'GET') {
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(fetchEvent.request, responseToCache);
					});
				}
				// After caching, return response.
				return response;
			})
			.catch((error) => {
				// For fetch errors, attempt to retrieve the resource from cache.
				return caches.match(fetchEvent.request.clone());
			})
			.catch((error) => {
				// If error getting resource from cache, do nothing.
				console.log(error);
			});
	};
	// Try to fetch the resource first after checking for the ID token.
	event.respondWith(getIdToken().then(requestProcessor, requestProcessor));
});

