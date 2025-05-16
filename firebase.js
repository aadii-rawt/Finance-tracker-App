import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCfkVE8NA2P6nfllIjQL7ziaBG2XOqRosQ",
  authDomain: "finance-tracker-7b929.firebaseapp.com",
  projectId: "finance-tracker-7b929",
  storageBucket: "finance-tracker-7b929.appspot.com", // fixed typo (.app to .app**spot**.com)
  messagingSenderId: "742985578792",
  appId: "1:742985578792:web:9685f39017b8a711de781d"
};

// 🔁 Prevent duplicate Firebase app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Protect against re-initializing Auth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Already initialized
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
