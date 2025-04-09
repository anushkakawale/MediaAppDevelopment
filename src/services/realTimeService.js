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
  try {
    console.log('Background message received:', remoteMessage);

    if (!remoteMessage || !remoteMessage.data) {
      console.warn('Invalid remote message format');
      return;
    }

    const { type, title, body } = remoteMessage.data;

    // Handle different notification types
    switch (type) {
      case 'new_blog':
        await showLocalNotification('New Blog Post', title || 'New content available');
        break;
      case 'blog_update':
        await showLocalNotification('Blog Updated', title || 'Content has been updated');
        break;
      case 'comment':
        await showLocalNotification('New Comment', body || 'Someone commented on your post');
        break;
      default:
        // Handle generic notifications
        if (title) {
          await showLocalNotification(title, body || 'New notification');
        }
    }

    // Refresh data in background if needed
    await setupFirestoreListeners();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error handling background message:', error);
    return Promise.resolve(); // Ensure we don't crash the background handler
  }
});