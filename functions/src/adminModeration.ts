import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
	Firestore,
	QuerySnapshot,
	QueryDocumentSnapshot
} from "@google-cloud/firestore";

const firestore: Firestore = admin.firestore();

export const makeAdmin = functions.https.onCall(async (data, context) => {
	try {
		const user = await admin.auth().getUserByEmail(data.email);
		await admin.auth().setCustomUserClaims(user.uid, {
			admin: true
		});

		await firestore
			.collection("admins")
			.doc(data.email)
			.set({
				data: data.email
			});

		return {
			message: `Success! ${data.email} was made an admin.`
		};
	} catch (err) {
		return {
			message: `Failure! ${data.email} could not be made an admin.`
		};
	}
});

export const removeAdmin = functions.https.onCall(async (data, context) => {
	try {
		const user = await admin.auth().getUserByEmail(data.email);
		await admin.auth().setCustomUserClaims(user.uid, {
			admin: false
		});

		await firestore
			.collection("admins")
			.doc(data.email)
			.delete();

		return {
			message: `Success! ${data.email} was made an admin.`
		};
	} catch (err) {
		return {
			message: `Failure! ${data.email} could not be made an admin.`
		};
	}
});
