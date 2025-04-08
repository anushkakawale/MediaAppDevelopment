import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyC-PbdtSUGVoGkGXxROxNbKtgIk4pJU0Iw",
  authDomain: "mediafeedappdevelopment.firebaseapp.com",
  projectId: "mediafeedappdevelopment",
  storageBucket: "mediafeedappdevelopment.appspot.com",
  messagingSenderId: "792343513287",
  appId: "1:792343513287:android:873e970b2630952bed96e2"
};

let app;
let auth;
let firestore;
let storage;

export const initializeFirebase = () => {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  
  // Initialize Firestore
  firestore = getFirestore(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  console.log('Firebase initialized successfully');
  
  return { app, auth, firestore, storage };
};

export const getFirebaseAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase first.');
  }
  return auth;
};

export const getFirebaseFirestore = () => {
  if (!firestore) {
    throw new Error('Firestore not initialized. Call initializeFirebase first.');
  }
  return firestore;
};

export const getFirebaseStorage = () => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Call initializeFirebase first.');
  }
  return storage;
};
