import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDk_a7lPHqJBRI2TzxTIMiSPj-E7Xyqizs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "oh-app-bcf24.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "oh-app-bcf24",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "oh-app-bcf24.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "272363630855",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:272363630855:web:9166049f1022a590d915a2",
};

// Tenant ID for command-center
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'command-center-rep5o'

const app = initializeApp(firebaseConfig)

// Initialize tenant-specific auth for command-center
export const tenantAuth = getAuth(app)
tenantAuth.tenantId = TENANT_ID

export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence.')
  }
})

export const getFirestoreDb = () => db
