import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getFirebaseAuth } from '../services/firebase';
import { initializeWebSocket, closeWebSocket } from '../services/websocketService';

// Screens
import SplashScreen from '../screens/common/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import EmailVerifiedScreen from '../screens/auth/EmailVerifiedScreen';
import SignupCompleteScreen from '../screens/auth/SignupComplete';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import BlogDetailPage from '../screens/blog/BlogDetailPage';
import AdminBlogEdit from '../screens/admin/AdminBlogEdit';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getFirebaseAuth();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log('Setting up auth state listener...');
        const unsubscribe = auth.onAuthStateChanged((user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user');
          if (user) {
            initializeWebSocket(user.uid).catch(err => {
              console.error('WebSocket initialization error:', err);
              setError('Failed to connect to real-time services');
            });
          } else {
            closeWebSocket();
          }
          setIsLoading(false);
        });

        return () => {
          console.log('Cleaning up auth state listener');
          unsubscribe();
          closeWebSocket();
        };
      } catch (err) {
        console.error('Auth setup error:', err);
        setError('Failed to initialize authentication');
        setIsLoading(false);
      }
    };

    setupAuth();
  }, [auth]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  console.log('Rendering AppNavigator');

  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress
          }
        })
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="EmailVerified" 
        component={EmailVerifiedScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="SignupComplete" 
        component={SignupCompleteScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Main" 
        component={DrawerNavigator} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="BlogDetail" 
        component={BlogDetailPage} 
      />
      <Stack.Screen 
        name="AdminBlogEdit" 
        component={AdminBlogEdit} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default AppNavigator;
