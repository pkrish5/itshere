import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCdQeD5827V6vSxBR8UxF7qWUrpMomNZFU",
  authDomain: "itshere-c9281.firebaseapp.com",
  projectId: "itshere-c9281",
  storageBucket: "itshere-c9281.appspot.com",
  messagingSenderId: "829158794102",
  appId: "1:829158794102:web:31e664983175b3fefe1057",
  measurementId: "G-RW82YSHQST"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export const db = getFirestore(app); 