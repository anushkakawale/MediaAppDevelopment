import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlogDetailPage({ route, navigation }) {
  const { post } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\nRead more at our app!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Text style={styles.iconText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleBookmark} style={styles.iconButton}>
              <Text style={styles.iconText}>{isBookmarked ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <Text style={styles.readTime}>5 min read</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>April 8, 2025</Text>
        </View>

        {/* Main Content */}
        <Text style={styles.title}>{post.title}</Text>
        <Image source={post.image} style={styles.image} />
        
        <Text style={styles.content}>
          Effortless looks are a piece of cake for fashionistas, but in this blog, we're going to break down exactly how to help you put together a stylish outfit without much effort. These looks are timeless, pretty available and can make you look like a million dollars. Ready to pull off effortless looks? Let's dive in.
        </Text>

        <Text style={styles.subheading}>Old money polo</Text>
        <Text style={styles.content}>
          For the ultra-stylish girlies who like dressing up and taking things up a notch every time they step out - old money aesthetic is your best friend. It is classy and mysterious enough to allow all eyes on you.
        </Text>

        {/* Hashtags */}
        <View style={styles.hashtagContainer}>
          <Text style={styles.hashtag}>#FashionTips</Text>
          <Text style={styles.hashtag}>#LookBook</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 16,
    color: '#000',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readTime: {
    fontSize: 14,
    color: '#666',
  },
  dot: {
    marginHorizontal: 8,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    lineHeight: 32,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 24,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  hashtag: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
});
