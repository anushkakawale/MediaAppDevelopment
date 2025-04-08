import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSocketInstance } from '../services/websocketService';
import { getFirebaseAuth } from '../services/firebase';

const ConnectionStatusOverlay = () => {
  const [wsStatus, setWsStatus] = useState('Connecting...');
  const [firebaseStatus, setFirebaseStatus] = useState('Checking...');

  useEffect(() => {
    // Check Firebase connection
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseStatus(auth.currentUser ? 'Connected' : 'Not Connected');
    });

    // Check WebSocket connection
    const socket = getSocketInstance();
    if (socket) {
      const checkConnection = () => {
        setWsStatus(socket.connected ? 'Connected' : 'Disconnected');
      };

      socket.on('connect', () => setWsStatus('Connected'));
      socket.on('disconnect', () => setWsStatus('Disconnected'));
      socket.on('connect_error', () => setWsStatus('Connection Error'));

      // Initial check
      checkConnection();
    }

    return () => {
      unsubscribe();
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, []);

  return (
    <View style={styles.overlay}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Connection Status</Text>
        <Text style={styles.status}>
          Firebase: <Text style={getStatusStyle(firebaseStatus)}>{firebaseStatus}</Text>
        </Text>
        <Text style={styles.status}>
          WebSocket: <Text style={getStatusStyle(wsStatus)}>{wsStatus}</Text>
        </Text>
      </View>
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Connected':
      return styles.connected;
    case 'Disconnected':
    case 'Not Connected':
      return styles.disconnected;
    case 'Connection Error':
      return styles.error;
    default:
      return styles.checking;
  }
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 10,
    zIndex: 9999,
  },
  statusContainer: {
    minWidth: 200,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
  connected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  disconnected: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  error: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  checking: {
    color: '#9E9E9E',
    fontWeight: 'bold',
  },
});

export default ConnectionStatusOverlay;