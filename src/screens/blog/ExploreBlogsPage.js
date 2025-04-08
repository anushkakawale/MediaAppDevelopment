import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { getAllBlogs, likeBlog, saveBlog } from '../../services/blogService';
import { connectToWebSocket } from '../../services/websocketService';
import { requestNotificationPermission, showNotification } from '../../services/notificationService';

const { width, height } = Dimensions.get('window');

const categories = [
  'All',
  'Fashion',
  'Lifestyle',
  'Travel',
  'Food',
  'Technology',
];

export default function ExploreBlogsPage({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const initializeComponent = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadBlogs(),
          setupWebSocket(),
          setupNotifications()
        ]);
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeComponent();

    return () => {
      mounted = false;
      // Cleanup WebSocket connections when component unmounts
      disconnectFromWebSocket();
    };
  }, [selectedCategory]);

  const setupWebSocket = async () => {
    try {
      await connectToWebSocket();
      
      // Setup notification socket listeners
      const notificationSocket = getSocketInstance('notification');
      if (notificationSocket) {
        notificationSocket.on('newBlog', (blog) => {
          setBlogs(prevBlogs => [blog, ...prevBlogs]);
          showNotification('New Blog Posted', blog.title);
        });
      }

      // Setup chat socket listeners
      const chatSocket = getSocketInstance('chat');
      if (chatSocket) {
        chatSocket.on('blogLiked', ({ blogId, likes }) => {
          setBlogs(prevBlogs =>
            prevBlogs.map(blog =>
              blog.id === blogId ? { ...blog, likes } : blog
            )
          );
        });
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
      // Don't throw the error to prevent black screen
      // Instead, the app will continue to work without real-time updates
    }
  };

  const setupNotifications = async () => {
    if (Platform.OS !== 'web') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('Notification permission denied');
      }
    }
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const blogsData = await getAllBlogs();
      if (selectedCategory !== 'All') {
        const filteredBlogs = blogsData.filter(
          (blog) => blog.category === selectedCategory
        );
        setBlogs(filteredBlogs);
      } else {
        setBlogs(blogsData);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      await likeBlog(blogId);
      // Update UI accordingly
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleSave = async (blogId) => {
    try {
      await saveBlog(blogId);
      // Update UI accordingly
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleShare = async (blog) => {
    try {
      await Share.share({
        message: `${blog.title}\n\nRead more at our app!`,
      });
    } catch (error) {
      console.error('Error sharing blog:', error);
    }
  };

  const renderBlogItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.blogItem}
      onPress={() => navigation.navigate('BlogDetailPage', { post: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
        <LottieView
          source={require('../../assets/lottie/continue-button.json')}
          autoPlay
          loop
          style={styles.lottieButton}
        />
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Image
            source={require('../../assets/like.svg')}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSave(item.id)}
        >
          <Image
            source={require('../../assets/save.svg')}
            style={styles.actionIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Image
            source={require('../../assets/share.svg')}
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={blogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={height - 120} // Account for category bar and safe areas
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(
            event.nativeEvent.contentOffset.y / (height - 120)
          );
          setCurrentIndex(index);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryContainer: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  blogItem: {
    width: width,
    height: height - 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  lottieButton: {
    width: 60,
    height: 60,
    alignSelf: 'flex-start',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  actionText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategory: {
    backgroundColor: '#fff',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#000',
  },
  blogItem: {
    width: width,
    height: height - 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  lottieButton: {
    width: 60,
    height: 60,
    alignSelf: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  actionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
});