import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Easing, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirebaseAuth } from '../../services/firebase';
import { initializeServices } from '../../../src';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeServices();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();

        const auth = getFirebaseAuth();
        const user = auth.currentUser;

        setTimeout(() => {
          if (user) {
            if (user.emailVerified) {
              navigation.navigate('Main');
            } else {
              navigation.navigate('EmailVerification', { email: user.email || '' });
            }
          } else {
            navigation.navigate('Auth');
          }
        }, 1500);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [navigation, fadeAnim]);

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
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
  },
  logoText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default SplashScreen;
