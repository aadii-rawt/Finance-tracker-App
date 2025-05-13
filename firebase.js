// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth ,setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfkVE8NA2P6nfllIjQL7ziaBG2XOqRosQ",
  authDomain: "finance-tracker-7b929.firebaseapp.com",
  projectId: "finance-tracker-7b929",
  storageBucket: "finance-tracker-7b929.firebasestorage.app",
  messagingSenderId: "742985578792",
  appId: "1:742985578792:web:9685f39017b8a711de781d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set auth persistence (user remains logged in)
setPersistence(auth, browserLocalPersistence);

export { auth, db };