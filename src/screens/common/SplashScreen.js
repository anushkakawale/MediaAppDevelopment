import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirebaseAuth } from '../../services/firebase';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    const timer = setTimeout(() => {
      if (user) {
        if (user.emailVerified) {
          navigation.replace('Main');
        } else {
          navigation.replace('EmailVerification', { email: user.email || '' });
        }
      } else {
        navigation.replace('Auth');
      }
    }, 2000);

    return () => clearTimeout(timer);
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
