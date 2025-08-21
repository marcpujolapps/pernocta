// Firebase client initialization for the Pernocta app
// Public config values (not secrets). If you need to use server SDK, create a separate file.
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

// Basic sanity check in dev (won't run in production builds if all defined)
if (process.env.NODE_ENV !== 'production') {
  for (const [k, v] of Object.entries(firebaseConfig)) {
    if (!v) console.warn(`[firebase] Missing env var for ${k}`);
  }
}

// Reuse existing app instance on hot reloads.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default firebaseApp;
