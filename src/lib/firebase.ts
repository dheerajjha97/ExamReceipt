import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig as any) : getApp();

let firestoreInstance: Firestore;
try {
  if (firebaseConfig && firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Custom databaseId initialization failed, falling back to default:', e);
  try {
    firestoreInstance = getFirestore(app);
  } catch (err2) {
    console.error('Firestore init error:', err2);
    firestoreInstance = {} as any;
  }
}

export const db = firestoreInstance;


