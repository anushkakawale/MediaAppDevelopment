import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Easing, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirebaseAuth } from '../../services/firebase';
import { initializeServices } from '../../services/initializeServices';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [initializationStep, setInitializationStep] = useState('Starting...');

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        console.log('Starting initialization process');
        setInitializationStep('Starting initialization...');
        
        // Start fade animation immediately
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();

        // Initialize services first
        setInitializationStep('Initializing services...');
        console.log('Initializing services...');
        const servicesInitialized = await initializeServices();
        if (!servicesInitialized) {
          throw new Error('Failed to initialize services');
        }
        console.log('Services initialized successfully');

        // Get auth state after services are initialized
        const auth = getFirebaseAuth();
        const user = auth.currentUser;

        // Ensure component is still mounted before state updates
        if (!isMounted) return;

        // Add a shorter delay to show splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!isMounted) return;
        setIsInitializing(false);

        // Navigate based on auth state
        if (user) {
          if (user.emailVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'EmailVerification', params: { email: user.email || '' } }],
            });
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      } catch (err) {
        console.error('Error in SplashScreen:', err);
        if (isMounted) {
          setError(err.message);
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [navigation, fadeAnim]);

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>{initializationStep}</Text>
        <Text style={styles.subText}>Please wait while we set up your app...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoPlaceholder, { opacity: fadeAnim }]}>
        <Text style={styles.logoText}>MyNewApp</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    margin: 20,
  },
});

export default SplashScreen;
