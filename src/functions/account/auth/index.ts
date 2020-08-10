import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { stripe } from '../../helper'

interface CustomerData {
	metadata: {
		uid: string
	}
	description?: string;
	email?: string;
}

const createCustomerRecord = async ({
	email,
	uid,
}: {
	email?: string;
	uid: string;
}) => {
	try {
		const customerData: CustomerData = {
			metadata: {
				uid: uid,
			},
			description: `Created by 'auth.user.onCreate'. ${uid}`
		};
		if (email) customerData.email = email;
		const customer = await stripe.customers.create(customerData);
		// Add a mapping record in Cloud Firestore.
		const customerRecord = {
			stripe: {
				customerID: customer.id,
				stripeLink: `https://dashboard.stripe.com${
					customer.livemode ? '' : '/test'
					}/customers/${customer.id}`,
			}
		};
		await admin
			.firestore()
			.collection("account")
			.doc("v1")
			.collection("accounts")
			.doc(uid)
			.set(customerRecord, { merge: true });

		return customerRecord;
	} catch (error) {
		functions.logger.error(error)
		return null;
	}
};

export const createCustomer = functions.auth.user().onCreate(async user => {
	const { email, uid } = user;
	await createCustomerRecord({ email, uid });
})
