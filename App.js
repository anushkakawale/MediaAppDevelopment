import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { LogBox, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation';
import { initializeServices } from './src/index';
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
  const navigationRef = useRef(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsInitialized(false);
        setError(null);

        const savedState = await AsyncStorage.getItem('navigationState');
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setInitialState(parsedState);
          } catch (parseError) {
            console.warn('Failed to parse navigation state:', parseError);
          }
        }

        const initPromise = initializeServices();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service initialization timed out')), 15000)
        );

        await Promise.race([initPromise, timeoutPromise]);
        setIsInitialized(true);
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err.message || 'Failed to initialize app');
        setIsInitialized(true);
      }
    };

    initApp();
  }, []);

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10, color: '#666' }}>Initializing...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>{error}</Text>
          <Text style={{ color: '#666', textAlign: 'center', margin: 10 }}>Please restart the app</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          initialState={initialState}
          onStateChange={(state) => {
            if (state) {
              AsyncStorage.setItem('navigationState', JSON.stringify(state));
            }
          }}
          onReady={() => {
            if (navigationRef.current) {
              configureDeepLinking(navigationRef.current);
            }
          }}
        >
          <AppNavigator />
          <ConnectionStatusOverlay />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;