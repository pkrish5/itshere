// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCdQeD5827V6vSxBR8UxF7qWUrpMomNZFU",
    authDomain: "itshere-c9281.firebaseapp.com",
    projectId: "itshere-c9281",
    storageBucket: "itshere-c9281.firebasestorage.app",
    messagingSenderId: "829158794102",
    appId: "1:829158794102:web:bd27db633f928ebbfe1057",
    measurementId: "G-L5YT1V3E3Z"
};

// Initialize Firebase
let app;
let auth;

// Make sure Firebase isn't initialized multiple times
try {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Firebase already initialized
  console.log("Firebase already initialized:", error);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };