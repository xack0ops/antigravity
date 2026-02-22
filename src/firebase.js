import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw",
  authDomain: "classnation-637c2.firebaseapp.com",
  projectId: "classnation-637c2",
  storageBucket: "classnation-637c2.firebasestorage.app",
  messagingSenderId: "781573304054",
  appId: "1:781573304054:web:4ad2e74f4531d1e074c6d7",
  measurementId: "G-MFBCG5R583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
