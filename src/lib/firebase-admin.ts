// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Ensure you have the service account key file in your project
// and its path set in an environment variable `GOOGLE_APPLICATION_CREDENTIALS`.
// For Firebase Studio, this is often handled automatically.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You might need to add your databaseURL if it's not automatically discovered
    // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
} else {
  app = admin.app();
}

const adminDb = admin.firestore();

export { adminDb, app };
