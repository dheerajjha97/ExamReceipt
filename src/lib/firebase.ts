import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig as any) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

