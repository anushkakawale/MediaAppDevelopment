// BlogPage.js
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const blogPosts = [
  {
    id: '1',
    title: '5 effortless looks that most stylish people are wearing right now',
    excerpt: 'Discover powerful strategies to control your thoughts and master your mindset.',
    image: require('../../assets/images and video/blogcover.jpg'),
  },
  {
    id: '2',
    title: 'The Art of Mindful Living: A Guide to Inner Peace',
    excerpt: 'Explore practical techniques for incorporating mindfulness into your daily routine.',
    image: require('../../assets/images and video/blog-detail-cover.jpg'),
  },
  
];

export default function BlogPage() {
  const navigation = useNavigation();

  const handleExplorePress = () => {
    navigation.navigate('ExploreBlogsPage');
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BlogDetailPage', { post: item })}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.excerpt}>{item.excerpt}</Text>
        <Text style={styles.readMore}>Read More →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Thrive Blog</Text>
        <TouchableOpacity style={styles.exploreButton} onPress={handleExplorePress}>
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={blogPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  exploreButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    color: '#4F46E5',
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    height: 180,
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  excerpt: {
    marginTop: 6,
    color: '#555',
  },
  readMore: {
    marginTop: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
});
