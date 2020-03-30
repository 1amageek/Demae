/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Service worker for Firebase Auth test app application. The
 * service worker caches all content and only serves cached content in offline
 * mode.
 */

importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-auth.js');

// Initialize the Firebase app in the web worker.
firebase.initializeApp({
	"apiKey": "AIzaSyAzlJNEjqDd0hTN1DRF6unm-Dm6oeGDr0E",
	"authDomain": "demae-210ed.firebaseapp.com",
	"databaseURL": "https://demae-210ed.firebaseio.com",
	"projectId": "demae-210ed",
	"storageBucket": "demae-210ed.appspot.com",
	"messagingSenderId": "64764786575",
	"appId": "1:64764786575:web:7abc0347e2d7140fe37dfa",
	"measurementId": "G-7V6KNW0L9J"
}
);

const CACHE_NAME = 'cache-v1';
const urlsToCache = [
	'/'
];

firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		console.log('user signed in', user.uid);
	} else {
		console.log('user signed out');
	}
});

/**
 * Returns a promise that resolves with an ID token if available.
 * @return {!Promise<?string>} The promise that resolves with an ID token if
 *     available. Otherwise, the promise resolves with null.
 */
const getIdToken = () => {
	return new Promise((resolve, reject) => {
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			unsubscribe();
			if (user) {
				user.getIdTokenResult().then((result) => {
					resolve({
						idToken: result.token,
						uid: user.uid,
						claim: result.claim
					});
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


/**
 * @param {string} url The URL whose origin is to be returned.
 * @return {string} The origin corresponding to given URL.
 */
const getOriginFromUrl = (url) => {
	// https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
	const pathArray = url.split('/');
	const protocol = pathArray[0];
	const host = pathArray[2];
	return protocol + '//' + host;
};


self.addEventListener('install', (event) => {
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

// As this is a test app, let's only return cached data when offline.
self.addEventListener('fetch', (event) => {
	const fetchEvent = event;
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

	const requestProcessor = (token) => {
		let req = event.request;
		let processRequestPromise = Promise.resolve();
		// For same origin https requests, append idToken to header.
		if (self.location.origin == getOriginFromUrl(event.request.url) &&
			(self.location.protocol == 'https:' ||
				self.location.hostname == 'localhost') &&
			token) {
			// Clone headers as request headers are immutable.
			const headers = new Headers();
			for (let entry of req.headers.entries()) {
				headers.append(entry[0], entry[1]);
			}
			// Add ID token to header. We can't add to Authentication header as it
			// will break HTTP basic authentication.
			const { idToken, uid, claim } = token
			headers.append('Authorization', 'Bearer ' + idToken);
			headers.append('uid', uid);
			if (claim) {
				if (claim.admin) {
					headers.append('admin', claim.admin);
				}
			}
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
					});
				} catch (e) {
					console.log(e)
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

self.addEventListener('activate', (event) => {
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
		})).then(() => clients.claim());
	}));
});
