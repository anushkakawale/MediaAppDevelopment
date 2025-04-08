import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
  const auth = getFirebaseAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        initializeWebSocket(user.uid); // Connect WebSocket after login
      } else {
        closeWebSocket(); // Disconnect on logout
      }
    });

    return () => unsubscribe(); 
  }, [auth]);

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen} />
      <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="BlogDetail" component={BlogDetailPage} />
      <Stack.Screen name="AdminBlogEdit" component={AdminBlogEdit} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
