import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirebaseAuth } from '../../services/firebase';
import { updateEmailVerificationStatus } from '../../services/authService';

const EmailVerifiedScreen = () => {
  const navigation = useNavigation();

  const handleContinue = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateEmailVerificationStatus(auth.currentUser.uid);
      }
      navigation.navigate('SignupComplete');
    } catch (error) {
      console.error('Error updating email verification status:', error);
      navigation.navigate('SignupComplete');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/verified.svg')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Now, try logging in with your new credentials
        </Text>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default EmailVerifiedScreen;
