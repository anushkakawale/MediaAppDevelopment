import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirebaseAuth } from '../../services/firebase';
import { getUserCoins, logout } from '../../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getFirebaseAuth();
  const [coins, setCoins] = useState(30);
  const scrollX = new Animated.Value(0);
  const brandScrollRef = useRef(null);

  const brandLogos = [
    require('../../assets/logos/AlmostGods.png'),
    require('../../assets/logos/Bershka.png'),
    require('../../assets/logos/DailyObjects.png'),
    require('../../assets/logos/H&M.png'),
    require('../../assets/logos/Lacoste.png'),
    require('../../assets/logos/levis-1.png'), 
    require('../../assets/logos/levis.png'),
    require('../../assets/logos/M&S.png'),
    require('../../assets/logos/Rebok.png'),
    require('../../assets/logos/UCB.png'),
    require('../../assets/logos/zara.png'),
  ];

  useEffect(() => {
    // Get user coins
    const fetchUserCoins = async () => {
      if (auth.currentUser) {
        const userCoins = await getUserCoins(auth.currentUser.uid);
        setCoins(userCoins);
      }
    };

    fetchUserCoins();

    // Auto-scroll for brand logos (marquee effect)
    const scrollAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -1200, // Adjust based on content width
        duration: 20000, 
        useNativeDriver: true,
      })
    );

    scrollAnimation.start();

    return () => {
      scrollAnimation.stop();
    };
  }, [auth.currentUser]);

  const handleExploreBlogs = () => {
    navigation.navigate('BlogPage');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi There!</Text>
          <View style={styles.coinsContainer}>
            <Image source={require('../../assets/coin.svg')} style={styles.coinIcon} />
            <Text style={styles.coinsText}>{coins}</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.welcomeText}>Welcome to our Media Feed App</Text>

          <TouchableOpacity style={styles.exploreButton} onPress={handleExploreBlogs} activeOpacity={0.8}>
            <Text style={styles.exploreButtonText}>Explore Blogs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandsSection}>
          <Text style={styles.brandsTitle}>Exclusive Brands</Text>

          <View style={styles.brandsScrollContainer}>
            <Animated.View 
              style={[
                styles.brandsScroll, 
                { transform: [{ translateX: scrollX }] }
              ]}
            >
              {brandLogos.map((logo, index) => (
                <View key={index} style={styles.brandLogoContainer}>
                  <Image source={logo} style={styles.brandLogo} />
                </View>
              ))}
            </Animated.View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F1ED',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444444',
    lineHeight: 30,
    maxWidth: '80%',
  },
  exploreButton: {
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
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  brandsSection: {
    marginBottom: 40,
  },
  brandsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  brandsScrollContainer: {
    height: 80,
    overflow: 'hidden',
  },
  brandsScroll: {
    flexDirection: 'row',
    height: 80,
  },
  brandLogoContainer: {
    marginRight: 20,
    backgroundColor: '#F3F1ED',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 30,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#000000',
    fontSize: 16,
  },
});

export default HomeScreen;