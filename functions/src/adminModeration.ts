import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp({});

export const makeAdmin = functions.https.onCall((data, context) => {
  return admin.auth().getUserByEmail(data.email).then((user: { uid: any; }) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
  }).then(() => {
    return {
      message: `Success! ${data.email} was made an admin.`
    }
  }).catch((err: Error) => {
    console.error(err);
    return err;
  });
}
)