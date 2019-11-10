const admin = require("firebase-admin");
admin.initializeApp({});

import { makeAdmin } from "./adminModeration";
import { sendNotification } from "./notification";

export { sendNotification, makeAdmin };
