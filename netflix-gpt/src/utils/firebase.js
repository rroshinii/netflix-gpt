// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Replace these placeholder values with your own keys from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA_SJZdh12qf-_7yntJ2p8B80JV4PsucnQ",
  authDomain: "netflixgpt-ca968.firebaseapp.com",
  projectId: "netflixgpt-ca968",
  storageBucket: "netflixgpt-ca968.firebasestorage.app",
  messagingSenderId: "88578096840",
  appId: "1:88578096840:web:e38ce8c41bfa1ad7b32ffd",
  measurementId: "G-VMMXB5QCWT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);