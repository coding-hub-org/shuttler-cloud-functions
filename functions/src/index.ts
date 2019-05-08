import * as functions from "firebase-functions";
import {
  Firestore,
  QuerySnapshot,
  QueryDocumentSnapshot
} from "@google-cloud/firestore";
import { Database, DataSnapshot } from "@firebase/database";
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

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
    if (request.params.location === undefined) {
      response.status(400);
      response.send("Please specify the location");
      return;
    }

    const tokens: string[] = [];
    const userRef = realtime.ref("/Users");

    await userRef.once("value").then((snapshot: DataSnapshot) => {
      snapshot.forEach((d: DataSnapshot) => {
        if (d.val().notifications.notifyLocation === request.params.location) {
          let tokenValues = d.val().notifications.tokens;
          for (let property in tokenValues) {
            if (
              tokenValues.hasOwnProperty(property) &&
              tokenValues.property == true
            ) {
              tokens.push(tokenValues.property);
            }
          }
        }
      });
    });

    const message = {
      data: { score: "850", time: "2:45" },
      tokens: tokens
    };

    admin
      .messaging()
      .sendMulticast(message)
      .then((mesRes: any) => {
        console.log(mesRes.successCount + " messages were sent successfully");
      });

    console.log(tokens);

    response.send("ngon");
  }
);
