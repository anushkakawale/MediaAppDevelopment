import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { LogBox, StatusBar, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation';
import { initializeServices } from './src/services/initializeServices';
import { configureDeepLinking } from './src/utils/deepLinking';
import { linking } from './src/navigation/linking';
import ConnectionStatusOverlay from './src/components/ConnectionStatusOverlay';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialState, setInitialState] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigationRef = useRef(null);
  const routeNameRef = useRef(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (navigationRef.current) {
      configureDeepLinking(navigationRef.current);
    }
  }, [navigationRef.current]);

  const initApp = async () => {
    try {
      console.log('Starting app initialization...');
      // Load navigation state and initialize services in parallel
      const [savedState, servicesInitialized] = await Promise.all([
        AsyncStorage.getItem('navigationState').catch(err => {
          console.warn('Failed to load navigation state:', err);
          return null;
        }),
        Promise.race([
          initializeServices(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Service initialization timeout')), 15000)
          )
        ])
      ]);

      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setInitialState(parsedState);
          console.log('Navigation state restored');
        } catch (parseError) {
          console.warn('Failed to parse navigation state:', parseError);
        }
      }

      console.log('Services initialized successfully');
      setError(null);
      setIsInitialized(true);
    } catch (err) {
      console.error('App initialization error:', err);
      setError(err.message || 'Failed to initialize app');
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
      } else {
        console.warn('Max retries reached, proceeding with app initialization');
        setError(null);
        setIsInitialized(true);
      }
    }
  };

  useEffect(() => {
    initApp();
  }, [retryCount]);

  const renderContent = () => {
    if (!isInitialized) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Initializing App...</Text>
          {retryCount > 0 && (
            <Text style={styles.retryText}>
              Retry attempt {retryCount}/{MAX_RETRIES}
            </Text>
          )}
        </View>
      );
    }

    return (
      <NavigationContainer
        ref={navigationRef}
        initialState={initialState}
        linking={linking}
        onStateChange={(state) => {
          const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
          routeNameRef.current = currentRouteName;
          AsyncStorage.setItem('navigationState', JSON.stringify(state));
        }}
      >
        <AppNavigator />
        <ConnectionStatusOverlay />
      </NavigationContainer>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {retryCount < MAX_RETRIES ? (
          <View>
            <Text style={styles.retryText}>
              Retrying... ({retryCount + 1}/{MAX_RETRIES})
            </Text>
            <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setRetryCount(0)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderContent()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#000000',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  retryText: {
    color: '#666',
    textAlign: 'center',
    margin: 10,
  },
  retryButton: {
    backgroundColor: '#0000ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default App;
