import * as Ballcap from "@1amageek/ballcap"
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"

export default () => {
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
		Ballcap.initialize(app)
	}
}
