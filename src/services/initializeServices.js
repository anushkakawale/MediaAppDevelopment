import { Platform } from 'react-native';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeFirebase, getFirebaseAuth } from './firebase';
import { connectToWebSocket } from './websocketService';
import { initializeRealTimeServices } from './realTimeService';

// Initialize Firebase app and services
export const initializeServices = async () => {
  // Create a promise that resolves after timeout
  const timeout = (ms) => new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  );

  try {
    // Initialize Firebase first with retries
    let retryCount = 0;
    const maxRetries = 3;
    let firebaseInitialized = false;

    while (retryCount < maxRetries && !firebaseInitialized) {
      try {
        // Race between Firebase initialization and timeout
        const { auth } = await Promise.race([
          initializeFirebase(),
          timeout(5000) // 5 second timeout
        ]);
        
        if (auth) {
          firebaseInitialized = true;
          console.log('Firebase initialized successfully');
        }
      } catch (firebaseError) {
        retryCount++;
        console.warn(`Firebase initialization attempt ${retryCount} failed:`, firebaseError.message);
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
    // Initialize WebSocket and real-time services in parallel
    const initPromises = [
      connectToWebSocket().catch(wsError => {
        console.warn('WebSocket connection failed:', wsError.message);
        // Don't block app startup, ConnectionStatusOverlay will handle reconnection
        return null;
      }),
      initializeRealTimeServices().catch(rtError => {
        console.warn('Real-time services initialization failed:', rtError);
        return null;
      })
    ];

    // Wait for all promises to settle (either resolve or reject)
    await Promise.allSettled(initPromises);
    console.log('All service initialization attempts completed');

    console.log('All services initialized successfully');
    return true;
  } catch (error) {
    console.error('Critical error during service initialization:', error);
    throw error; 
  }
};