# Cloud Functions

### Installation

Install Firebase tools for Firebase Cloud Function.

```sh
$ npm install -g firebase-tools@6.8.0
$ firebase login
$ firebase use <firebase project id>
$ cd functions
$ npm install
```

Download serviceAccountKey.json from Firebase

1. Go to Projet Settings
2. Go to Service Accounts tab
3. Click Generate new private key
4. Download and place the file in functions folder
5. Rename the file to serviceAccountKey.json

### Deploy

```sh
$ cd functions
$ npm run deploy
```
