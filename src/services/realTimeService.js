import { sendMessage, addEventListener } from './websocketService';
import messaging from '@react-native-firebase/messaging';
import { subscribeToBlogs } from './blogService';
import { setupNotifications, subscribeToTopic } from './notificationService';

// Initialize real-time services
export const initializeRealTimeServices = async () => {
  try {
    // Setup push notifications
    await setupNotifications();
    
    // Subscribe to blog updates topic
    await subscribeToTopic('blog_updates');
    
    // Setup WebSocket event listeners
    setupWebSocketListeners();
    
    // Setup Firestore real-time listeners
    setupFirestoreListeners();
    
    return true;
  } catch (error) {
    console.error('Error initializing real-time services:', error);
    return false;
  }
};

// Setup WebSocket event listeners
const setupWebSocketListeners = () => {
  // Listen for new blog posts
  addEventListener('new_blog', (data) => {
    // Handle new blog notification
    showLocalNotification('New Blog Post', data.title);
  });

  // Listen for blog updates
  addEventListener('update_blog', (data) => {
    // Handle blog update notification
    showLocalNotification('Blog Updated', `${data.title} has been updated`);
  });
};

// Setup Firestore real-time listeners
const setupFirestoreListeners = () => {
  // Subscribe to blog changes
  return subscribeToBlogs((blogs) => {
    // Handle blog changes
    console.log('Blogs updated:', blogs);
  });
};

// Show local notification
const showLocalNotification = async (title, body) => {
  try {
    await messaging().requestPermission();
    
    const channelId = await messaging().createChannel({
      id: 'blog_notifications',
      name: 'Blog Notifications',
      importance: 4, // High importance
      vibration: true,
    });

    messaging().displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        priority: 'high',
        vibrate: true,
      },
      ios: {
        sound: true,
      },
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Handle incoming push notifications when app is in background
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message:', remoteMessage);
  
  // Handle the notification based on the type
  if (remoteMessage.data.type === 'new_blog') {
    showLocalNotification(
      'New Blog Post',
      remoteMessage.data.title
    );
  } else if (remoteMessage.data.type === 'blog_update') {
    showLocalNotification(
      'Blog Updated',
      remoteMessage.data.title
    );
  }
});