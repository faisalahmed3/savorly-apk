// services/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtiIhG3m8DEQao1tyFtLXiJumBiGVDSIE",
  authDomain: "savorly-7ef85.firebaseapp.com",
  projectId: "savorly-7ef85",
  storageBucket: "savorly-7ef85.firebasestorage.app",
  messagingSenderId: "1092547273666",
  appId: "1:1092547273666:web:ee909916cda4438c056c5b",
};

// ✅ Initialize the app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth with persistent login in React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Export the app in case you need it for Firestore/Storage later
export default app;
