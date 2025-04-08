import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBlogs, deleteBlog } from '../../services/blogService';

const AdminBlogList = () => {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const blogData = await getBlogs();
      setBlogs(blogData);
      setError('');
    } catch (err) {
      setError('Failed to load blogs');
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = () => {
    navigation.navigate('AdminBlogEdit', { mode: 'create' });
  };

  const handleEditBlog = (blog) => {
    navigation.navigate('AdminBlogEdit', { mode: 'edit', blogId: blog.id });
  };

  const handleDeleteBlog = (blogId) => {
    Alert.alert(
      'Delete Blog',
      'Are you sure you want to delete this blog post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBlog(blogId);
              setBlogs(blogs.filter(blog => blog.id !== blogId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete blog post');
              console.error('Error deleting blog:', err);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.blogItem}>
      <View style={styles.blogInfo}>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.blogDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditBlog(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBlog(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Blogs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddBlog}
          >
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <FlatList
          data={blogs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  blogItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  blogInfo: {
    flex: 1,
    marginBottom: 12,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  blogDate: {
    fontSize: 14,
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#000000',
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default AdminBlogList;