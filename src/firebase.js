
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCugxqVNUQxLY2f2BV_CLPy9qM_MR1JiLM",
  authDomain: "sistema-hap-samu-maule.firebaseapp.com",
  projectId: "sistema-hap-samu-maule",
  storageBucket: "sistema-hap-samu-maule.firebasestorage.app",
  messagingSenderId: "1073018138268",
  appId: "1:1073018138268:web:d50ee0830a5c24b7b5c759",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
