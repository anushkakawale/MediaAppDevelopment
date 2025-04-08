import { Platform } from 'react-native';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeFirebase, getFirebaseAuth } from './services/firebase';
import { connectToWebSocket } from './services/websocketService';
import { initializeRealTimeServices } from './services/realTimeService';

// Initialize Firebase app and services
const initializeServices = async () => {
  try {
    // Initialize Firebase first with retries
    let retryCount = 0;
    const maxRetries = 3;
    let firebaseInitialized = false;

    while (retryCount < maxRetries && !firebaseInitialized) {
      try {
        const { auth } = initializeFirebase();
        if (auth) {
          firebaseInitialized = true;
          console.log('Firebase initialized successfully');
        }
      } catch (firebaseError) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Firebase initialization failed after ${maxRetries} attempts: ${firebaseError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const functions = getFunctions();

    // Connect to Functions emulator in development
    if (__DEV__) {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      } catch (emulatorError) {
        console.warn('Failed to connect to Functions emulator:', emulatorError);
        // Continue execution as this is not critical
      }
    }
    // Initialize WebSocket with better error handling and longer timeout
    try {
      const wsTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000)
      );
      await Promise.race([connectToWebSocket(), wsTimeout]);
      console.log('WebSocket connection established');
    } catch (wsError) {
      console.warn('WebSocket connection failed:', wsError.message);
      // Don't throw error here to allow app to continue loading
      // The ConnectionStatusOverlay component will handle reconnection
    }
    try {
      await initializeRealTimeServices();
      console.log('Real-time services initialized');
    } catch (rtError) {
      console.warn('Real-time services initialization failed:', rtError);
    }

    console.log('All services initialized successfully');
    return true;
  } catch (error) {
    console.error('Critical error during service initialization:', error);
    throw error; 
  }
};
