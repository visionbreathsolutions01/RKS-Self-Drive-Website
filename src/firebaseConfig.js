import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCY9sgVMBvhULA6Gz0Qgv-U8cwXFlykV9w",
  authDomain: "rks-self-drive.firebaseapp.com",
  projectId: "rks-self-drive",
  storageBucket: "rks-self-drive.firebasestorage.app",
  messagingSenderId: "159947417965",
  appId: "1:159947417965:web:8563875c61c94f2c071264",
  measurementId: "G-Y7062GXENY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only works in the browser
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;