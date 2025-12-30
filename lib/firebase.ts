import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDk_a7lPHqJBRI2TzxTIMiSPj-E7Xyqizs",
  authDomain: "oh-app-bcf24.firebaseapp.com",
  projectId: "oh-app-bcf24",
  storageBucket: "oh-app-bcf24.appspot.com",
  messagingSenderId: "272363630855",
  appId: "1:272363630855:web:9166049f1022a590d915a2",
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
