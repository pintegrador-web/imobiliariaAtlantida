import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key-123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-atlantida.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-atlantida",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-atlantida.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_APP_ID || "1:123456789:web:abcdef"
};

let app, auth, db;
let useMockData = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase config error, falling back to mock data.", error);
  useMockData = true;
}

export {
  app, auth, db, useMockData,
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  signInAnonymously
};