
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";

// Updated Configuration for project gen-lang-client-0866692767
export const firebaseConfig = {
  apiKey: "AIzaSyAYnxNyTXGTFoc326t3etbRiLgGHNV-QZk",
  authDomain: "gen-lang-client-0866692767.firebaseapp.com",
  projectId: "gen-lang-client-0866692767",
  storageBucket: "gen-lang-client-0866692767.firebasestorage.app",
  messagingSenderId: "279685047132",
  appId: "1:279685047132:web:f24a542355e851fd851799",
  measurementId: "G-JNGZ44RR2R"
};

// Initialize Firebase (Singleton pattern)
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
let functions: Functions;

try {
  // Check if firebase app is already initialized to avoid "Firebase App named '[DEFAULT]' already exists" error
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }

  // Initialize services using the specific app instance
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  // Explicitly use 'us-central1' to match standard deployment
  functions = getFunctions(app, 'us-central1');
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { app, db, storage, auth, functions };
