// src/lib/firebase.ts
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: 'finpulse-860du',
  appId: '1:494483986044:web:44b47156a97d9c6042dbf9',
  storageBucket: 'finpulse-860du.appspot.com',
  apiKey: 'AIzaSyD6DCxuv9a7gYFXrQkZ3d4gvdVxiYcKbBs',
  authDomain: 'finpulse-860du.firebaseapp.com',
  messagingSenderId: '494483986044',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// This is needed for phone auth
if (typeof window !== 'undefined') {
  (window as any).auth = auth;
}


export {app, auth, db};
