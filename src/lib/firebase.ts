
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS56_fmoU82oumiRsBJiuey_5WpHdQW7M",
  authDomain: "netzero-2e557.firebaseapp.com",
  projectId: "netzero-2e557",
  storageBucket: "netzero-2e557.firebasestorage.app",
  messagingSenderId: "117946636062",
  appId: "1:117946636062:web:43be8fe1dda0e07a449b0f",
  measurementId: "G-8ZK57SCV7P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
