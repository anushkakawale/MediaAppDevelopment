import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const handleContinue = () => {
    navigation.navigate('Home');
  };

  const openCoinsInfo = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCoinsInfo = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Thank You for Joining!</Text>

        <View style={styles.animationContainer}>
          <SvgXml
            width="100%"
            height="100%"
            xml={require('../../assets/coin.svg')}
            style={styles.animation}
          />
        </View>

        <Text style={styles.coinsText}>
          You've received <Text style={styles.coinsHighlight}>30 coins</Text>
        </Text>

        <TouchableOpacity style={styles.infoButton} onPress={openCoinsInfo}>
          <Text style={styles.infoButtonText}>What are coins?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Let's Go</Text>
        </TouchableOpacity>
      </View>

      {/* Coins Info Modal */}
      <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={closeCoinsInfo}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What are Coins?</Text>
              <TouchableOpacity onPress={closeCoinsInfo}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Coins are our in-app currency that you can use to:</Text>

              <View style={styles.coinFeature}>
                <View style={styles.coinBullet} />
                <Text style={styles.featureText}>Unlock premium blog content</Text>
              </View>

              <View style={styles.coinFeature}>
                <View style={styles.coinBullet} />
                <Text style={styles.featureText}>Support your favorite content creators</Text>
              </View>

              <View style={styles.coinFeature}>
                <View style={styles.coinBullet} />
                <Text style={styles.featureText}>Access exclusive fashion events</Text>
              </View>

              <View style={styles.coinFeature}>
                <View style={styles.coinBullet} />
                <Text style={styles.featureText}>Get personalized style recommendations</Text>
              </View>

              <Text style={styles.modalText}>
                You can earn more coins by engaging with content, sharing posts, and participating in community events.
              </Text>
              
              <TouchableOpacity style={styles.gotItButton} onPress={closeCoinsInfo}>
                <Text style={styles.gotItButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 40,
    textAlign: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  coinsText: {
    fontSize: 18,
    color: '#444444',
    marginBottom: 15,
    textAlign: 'center',
  },
  coinsHighlight: {
    fontWeight: 'bold',
    color: '#000000',
  },
  infoButton: {
    marginBottom: 40,
  },
  infoButtonText: {
    color: '#00FF95',
    fontSize: 16,
    textDecorationLine: 'underline',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    fontSize: 20,
    color: '#787878',
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 20,
  },
  coinFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  coinBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF95',
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#444444',
  },
  gotItButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  gotItButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;