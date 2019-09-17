import * as functions from "firebase-functions";
import {
  Firestore,
  QuerySnapshot,
  QueryDocumentSnapshot
} from "@google-cloud/firestore";
import { Database, DataSnapshot } from "@firebase/database";
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shuttler-p001.firebaseio.com"
});

// admin.initializeApp(functions.config().firebase);

const firestore: Firestore = admin.firestore();
const realtime: Database = admin.database();

exports.helloWorld = functions.https.onRequest(async (request, response) => {
  const drivers: any[] = [];
  await firestore
    .collection("drivers")
    .get()
    .then((query: QuerySnapshot) => {
      query.forEach((snapshot: QueryDocumentSnapshot) => {
        drivers.push(snapshot.data());
      });

      response.send(drivers);
    })
    .catch(error => {
      console.log(error);
    });
});

exports.sendNotification = functions.https.onRequest(
  async (request, response) => {
    // Check if location param is provided
    console.log(request.query);
    if (request.query.location === undefined) {
      response.status(400);
      response.send("Please specify the location");
      return;
    }

    const tokens: string[] = [];
    const userRef = realtime.ref("/Users");

    await userRef
      .once("value")
      .then((snapshot: DataSnapshot) => {
        snapshot.forEach((d: DataSnapshot) => {
          if (d.val().notifications.notifyLocation === request.query.location) {
            const tokenValues = d.val().notifications.tokens;
            let index: number = 0;
            for (const property in tokenValues) {
              if (
                tokenValues.hasOwnProperty(property) &&
                Object.values(tokenValues)[index] === true
              ) {
                tokens.push(property);
              }
              index++;
            }
          }
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    if (tokens.length === 0) {
      response.send("Token list is empty");
      return;
    }

    console.log("tokens");
    console.log(tokens);

    const messages: any[] = [];

    tokens.forEach((token: string) => {
      messages.push({
        notification: {
          title: "Shuttler",
          body: `Shuttle will be at ${
            request.query.location
          } in approximately 1 minute`
        },
        token: token
      });
    });

    await admin.messaging().sendAll(messages);

    console.log(tokens);

    response.send("Notifications sent");
  }
);

exports.makeAdmin = functions.https.onCall((data, context) => {
  return admin.auth().getUserByEmail(data.email).then(user => {
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