import io from 'socket.io-client';
import { Platform } from 'react-native';

// Get the development server IP address for Expo and React Native CLI
const getDevelopmentServerIP = () => {
  if (Platform.OS === 'android') {
    // Android Emulator uses 10.0.2.2, real device uses local network IP
    return __DEV__ ? '10.0.2.2' : 'localhost';
  }
  // iOS uses localhost for both simulator and real device in development
  return 'localhost';
};

// Helper function to validate WebSocket URL
const validateWebSocketURL = (url) => {
  if (!url) {
    throw new Error('WebSocket URL is undefined');
  }
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid WebSocket URL: ${url}`);
  }
};

const DEV_SERVER_IP = getDevelopmentServerIP();

const CHAT_WEBSOCKET_URL = __DEV__ 
  ? `ws://${DEV_SERVER_IP}:3001`
  : 'wss://your-production-chat-url';

// Add connection status tracking
let isConnecting = false;
let connectionRetryCount = 0;
const MAX_CONNECTION_RETRIES = 3;
const CONNECTION_RETRY_DELAY = 2000; // 2 seconds

const NOTIFICATION_WEBSOCKET_URL = __DEV__
  ? `ws://${DEV_SERVER_IP}:3002`
  : 'wss://your-production-notification-url';

const SKIP_WEBSOCKET_IN_DEV = false;

let chatSocket = null;
let notificationSocket = null;

let connectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;

const listeners = new Map();
const sockets = new Map();

const createSocketConnection = (url, type) => {
  return new Promise((resolve, reject) => {
    // Don't block app initialization if WebSocket fails
    if (__DEV__ && SKIP_WEBSOCKET_IN_DEV) {
      console.log(`Skipping ${type} WebSocket connection in development mode`);
      resolve(null);
      return;
    }

    if (isConnecting) {
      console.log(`${type} WebSocket connection already in progress...`);
      resolve(null); // Don't block, just return
      return;
    }

    isConnecting = true;
    connectionRetryCount = 0;

    try {
      validateWebSocketURL(url);
      console.log(`Attempting to connect to ${type} WebSocket at ${url}`);
    } catch (error) {
      isConnecting = false;
      console.error(`Invalid ${type} WebSocket URL:`, error);
      resolve(null); // Don't block app initialization
      return;
    }
    // Add timeout for connection attempts with cleanup
    const connectionTimeout = setTimeout(() => {
      isConnecting = false;
      reject(new Error(`${type} WebSocket connection timeout after 10 seconds`));
    }, 10000);

    // Skip WebSocket in development if configured
    if (__DEV__ && SKIP_WEBSOCKET_IN_DEV) {
      clearTimeout(connectionTimeout);
      console.log(`Skipping ${type} WebSocket connection in development mode`);
      isConnecting = false;
      resolve(null);
      return;
    }
    if (__DEV__ && SKIP_WEBSOCKET_IN_DEV) {
      console.log(`Skipping ${type} WebSocket connection in development mode`);
      resolve(null);
      return;
    }

    try {
      console.log(`Attempting to connect to ${type} WebSocket server at:`, url);
      const socket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 10000 
      });

      socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log(`${type} WebSocket connected successfully. Socket ID:`, socket.id);
        console.log('Connection details:', {
          url,
          transport: socket.io.engine.transport.name,
          protocol: socket.io.engine.protocol,
          connected: socket.connected,
          id: socket.id
        });
        resolve(socket);
      });

      socket.on('connect_error', async (error) => {
        clearTimeout(connectionTimeout);
        isConnecting = false;
        console.error('WebSocket connection error:', error.message);
        console.log('Connection attempt details:', {
          url,
          transport: socket?.io?.engine?.transport?.name,
          protocol: socket?.io?.engine?.protocol,
          connected: socket?.connected,
          disconnected: socket?.disconnected,
          id: socket?.id,
          error: error.stack
        });

        if (connectionRetryCount < MAX_CONNECTION_RETRIES) {
          connectionRetryCount++;
          console.log(`Retrying connection (${connectionRetryCount}/${MAX_CONNECTION_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
          isConnecting = false;
          try {
            const newSocket = await createSocketConnection(url, type);
            resolve(newSocket);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          console.error(`${type} WebSocket connection failed after ${MAX_CONNECTION_RETRIES} attempts`);
          isConnecting = false;
          reject(error);
        }
      });

      socket.io.on('error', (error) => {
        console.error('Socket.IO engine error:', error);
      });

      socket.io.on('reconnect_attempt', () => {
        console.log('Socket.IO engine attempting reconnect with transport:', 
          socket.io.engine.transport.name
        );
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected. Reason:', reason);
        isConnecting = false;
        console.log('Attempting to reconnect...');
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`WebSocket reconnection attempt ${attemptNumber}...`);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      });

      socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed after all attempts');
      });

      socket.on('message', (data) => {
        try {
          const eventType = data.type;
          if (eventType && listeners.has(eventType)) {
            const eventListeners = listeners.get(eventType) || [];
            eventListeners.forEach((listener) => listener(data.payload));
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      reject(error);
    }
  });
};

export const connectToWebSocket = async () => {
  try {
    const [chatConn, notificationConn] = await Promise.all([
      createSocketConnection(CHAT_WEBSOCKET_URL, 'Chat'),
      createSocketConnection(NOTIFICATION_WEBSOCKET_URL, 'Notification')
    ]);
    
    sockets.set('chat', chatConn);
    sockets.set('notification', notificationConn);
    
    return chatConn; // Return chat socket for backward compatibility
  } catch (error) {
    console.error('Error connecting to WebSocket servers:', error);
    throw error;
  }
};

export const disconnectFromWebSocket = () => {
  for (const [type, socket] of sockets.entries()) {
    if (socket) {
      socket.disconnect();
      console.log(`${type} WebSocket disconnected`);
    }
  }
  sockets.clear();
};

export const addEventListener = (eventType, callback) => {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, []);
  }

  const eventListeners = listeners.get(eventType) || [];
  eventListeners.push(callback);
  listeners.set(eventType, eventListeners);

  return () => removeEventListener(eventType, callback);
};

export const removeEventListener = (eventType, callback) => {
  if (listeners.has(eventType)) {
    const eventListeners = listeners.get(eventType) || [];
    const updatedListeners = eventListeners.filter((listener) => listener !== callback);
    listeners.set(eventType, updatedListeners);
  }
};

export const sendMessage = (eventType, data, socketType = 'chat') => {
  const socket = sockets.get(socketType);
  if (socket && socket.connected) {
    socket.emit(eventType, data);
  } else {
    console.error(`${socketType} WebSocket is not connected`);
  }
};

export const getSocketInstance = (type = 'chat') => {
  return sockets.get(type);
};
