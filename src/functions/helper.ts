import express from 'express'
import * as functions from 'firebase-functions'
export const regionFunctions = functions.region('us-central1')

export const getIdToken = (req: express.Request) => {
	const authorizationHeader = req.headers.authorization || '';
	const components = authorizationHeader.split(' ');
	return components.length > 1 ? components[1] : '';
}
