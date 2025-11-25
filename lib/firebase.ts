import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let db: Firestore | undefined

function validateFirebaseConfig() {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.error("[v0] Missing Firebase environment variables:", missing)
    return false
  }

  return true
}

export function initializeFirebase(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser")
  }

  try {
    const apps = getApps()
    if (apps.length === 0) {
      console.log("[v0] Initializing Firebase app...")
      const app = initializeApp(firebaseConfig)
      console.log("[v0] Firebase app initialized")
      return app
    } else {
      console.log("[v0] Using existing Firebase app")
      return apps[0]
    }
  } catch (error) {
    console.error("[v0] Firebase initialization error:", error)
    throw error
  }
}

export function getFirestoreDb(): Firestore {
  try {
    const app = initializeFirebase()
    const db = getFirestore(app)
    console.log("[v0] Firestore instance created")
    return db
  } catch (error) {
    console.error("[v0] Error getting Firestore:", error)
    throw error
  }
}
