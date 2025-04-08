import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerifiedIcon from '../../assets/verified.svg';
import CoinIcon from '../../assets/coin.svg';

const SignupCompleteScreen = () => {
  const navigation = useNavigation();
  const coinScale = useRef(new Animated.Value(0)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(coinScale, {
          toValue: 1,
          tension: 20,
          friction: 2,
          useNativeDriver: true,
        }),
        Animated.timing(coinOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <VerifiedIcon
          width={200}
          height={200}
          style={styles.image}
        />

        <Text style={styles.title}>Welcome to MyNewApp!</Text>

        <Text style={styles.description}>
          Your account has been successfully created. As a welcome gift, you've received
        </Text>

        <Animated.View style={[styles.coinContainer, {
          transform: [{ scale: coinScale }],
          opacity: coinOpacity,
        }]}>
          <CoinIcon width={40} height={40} style={styles.coinIcon} />
          <Text style={styles.coinText}>30 coins</Text>
        </Animated.View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  coinIcon: {
    marginRight: 10,
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupCompleteScreen;
