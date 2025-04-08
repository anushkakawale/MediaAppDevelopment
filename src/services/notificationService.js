import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseFirestore } from './firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Setup notifications
export const setupNotifications = async () => {
  await requestNotificationPermission();
  setupForegroundNotificationHandler();
  
  // Get and save FCM token
  const token = await getFCMToken();
  console.log('FCM Token:', token);
  
  // Subscribe to topics
  await subscribeToTopic('new_blogs');
};

// Request permission for notifications
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      return enabled;
    } else {
      // Android doesn't need explicit permission for FCM
      return true;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get FCM token
export const getFCMToken = async () => {
  try {
    // Check if we already have a token
    const savedToken = await AsyncStorage.getItem('fcmToken');
    if (savedToken) return savedToken;
    
    // Get new token
    const token = await messaging().getToken();
    if (token) {
      // Save token to AsyncStorage
      await AsyncStorage.setItem('fcmToken', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Save FCM token to Firestore
export const saveFCMToken = async (userId, token) => {
  try {
    const firestore = getFirebaseFirestore();
    
    await setDoc(doc(firestore, 'fcmTokens', userId), {
      token,
      updatedAt: new Date(),
      platform: Platform.OS
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Subscribe to topic
export const subscribeToTopic = async (topic) => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
};

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic) => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
};

// Set up foreground notification handler
export const setupForegroundNotificationHandler = () => {
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);
    // Handle the notification (e.g., show a local notification)
  });
};

// Send notification to topic (admin only)
export const sendNotificationToTopic = async (topic, title, body, data) => {
  try {
    const firestore = getFirebaseFirestore();
    
    // Add notification to Firestore for record-keeping
    await addDoc(collection(firestore, 'notifications'), {
      topic,
      title,
      body,
      data,
      sentAt: new Date()
    });
    
    // In a real app, you would use a Cloud Function or server API to send notifications
    // This is a placeholder for the implementation
    console.log(`Sending notification to topic ${topic}: ${title} - ${body}`);
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};