import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirebaseAuth } from '../../services/firebase';
import { sendEmailVerification } from 'firebase/auth';

const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const handleResendEmail = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert('Verification email sent again. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  };

  const handleVerified = () => {
    navigation.navigate('EmailVerified');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/email-verify-asset.svg')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          We've sent a verification link to{' '}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
        <Text style={styles.instruction}>
          Please check your inbox and click the verification link to continue.
        </Text>
        <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
          <Text style={styles.resendButtonText}>Resend Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifiedButton} onPress={handleVerified}>
          <Text style={styles.verifiedButtonText}>I've Verified My Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  image: { width: 200, height: 200, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000000', textAlign: 'center' },
  description: { fontSize: 16, color: '#444444', textAlign: 'center', marginBottom: 10 },
  emailText: { fontWeight: 'bold', color: '#000000' },
  instruction: { fontSize: 16, color: '#444444', textAlign: 'center', marginBottom: 40 },
  resendButton: { marginBottom: 20 },
  resendButtonText: { color: '#000000', fontSize: 16, textDecorationLine: 'underline' },
  verifiedButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default EmailVerificationScreen;
