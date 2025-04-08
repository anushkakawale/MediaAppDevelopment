import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ArrowLeft, Image as ImageIcon, Hash, Type } from 'react-native-feather';
import * as ImagePicker from 'react-native-image-picker';
import { getAllBlogs, deleteBlog } from '../../services/blogService';
import { getFirebaseAuth } from '../../services/firebase';
import { checkIfUserIsAdmin } from '../../services/authService';

const ContentTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  SUBHEADING: 'subheading',
};

const AdminBlogEdit = ({ route, navigation }) => {
  const { blogId } = route.params;
  const isNewBlog = blogId === 'new';

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');

  useEffect(() => {
    if (!isNewBlog) {
      loadBlogData();
    }
  }, []);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      const blog = await getBlogById(blogId);
      if (blog) {
        setTitle(blog.title);
        setMainImage(blog.imageUrl);
        setContentBlocks(blog.content || []);
        setHashtags(blog.hashtags || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (isMainImage = false) => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (!result.didCancel && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        if (isMainImage) {
          setMainImage(imageUri);
        } else {
          addContentBlock(ContentTypes.IMAGE, imageUri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addContentBlock = (type, content = '') => {
    setContentBlocks([...contentBlocks, { type, content }]);
  };

  const updateContentBlock = (index, content) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].content = content;
    setContentBlocks(newBlocks);
  };

  const removeContentBlock = (index) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim() || !mainImage) {
      Alert.alert('Error', 'Title and main image are required');
      return;
    }

    try {
      setLoading(true);
      const blogData = {
        title: title.trim(),
        content: contentBlocks,
        hashtags,
        date: new Date(),
      };

      if (isNewBlog) {
        await createBlog(blogData, { uri: mainImage, name: 'main-image.jpg' });
        Alert.alert('Success', 'Blog created successfully');
      } else {
        await updateBlog(blogId, blogData, mainImage.startsWith('file:') ? { uri: mainImage, name: 'main-image.jpg' } : null);
        Alert.alert('Success', 'Blog updated successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case ContentTypes.TEXT:
        return (
          <View key={index} style={styles.contentBlock}>
            <TextInput
              style={styles.contentInput}
              multiline
              value={block.content}
              onChangeText={(text) => updateContentBlock(index, text)}
              placeholder="Enter text content"
            />
            <TouchableOpacity
              style={styles.removeBlockButton}
              onPress={() => removeContentBlock(index)}
            >
              <Text style={styles.removeBlockText}>×</Text>
            </TouchableOpacity>
          </View>
        );

      case ContentTypes.SUBHEADING:
        return (
          <View key={index} style={styles.contentBlock}>
            <TextInput
              style={styles.subheadingInput}
              value={block.content}
              onChangeText={(text) => updateContentBlock(index, text)}
              placeholder="Enter subheading"
            />
            <TouchableOpacity
              style={styles.removeBlockButton}
              onPress={() => removeContentBlock(index)}
            >
              <Text style={styles.removeBlockText}>×</Text>
            </TouchableOpacity>
          </View>
        );

      case ContentTypes.IMAGE:
        return (
          <View key={index} style={styles.contentBlock}>
            <Image source={{ uri: block.content }} style={styles.contentImage} />
            <TouchableOpacity
              style={styles.removeBlockButton}
              onPress={() => removeContentBlock(index)}
            >
              <Text style={styles.removeBlockText}>×</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft stroke="#000000" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewBlog ? 'Create Blog' : 'Edit Blog'}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter blog title"
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={styles.mainImageContainer}
          onPress={() => handleImagePick(true)}
        >
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.mainImage} />
          ) : (
            <View style={styles.mainImagePlaceholder}>
              <ImageIcon stroke="#666" width={32} height={32} />
              <Text style={styles.mainImageText}>Add main image</Text>
            </View>
          )}
        </TouchableOpacity>

        {contentBlocks.map(renderContentBlock)}

        <View style={styles.addBlockContainer}>
          <TouchableOpacity
            style={styles.addBlockButton}
            onPress={() => addContentBlock(ContentTypes.TEXT)}
          >
            <Type stroke="#FFFFFF" width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBlockButton}
            onPress={() => addContentBlock(ContentTypes.SUBHEADING)}
          >
            <Text style={styles.addBlockButtonText}>H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBlockButton}
            onPress={() => handleImagePick()}
          >
            <ImageIcon stroke="#FFFFFF" width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.hashtagSection}>
          <View style={styles.hashtagInput}>
            <Hash stroke="#666" width={20} height={20} />
            <TextInput
              style={styles.hashtagTextInput}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={addHashtag}
              placeholder="Add hashtag"
              returnKeyType="done"
            />
          </View>
          <View style={styles.hashtagContainer}>
            {hashtags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.hashtag}
                onPress={() => removeHashtag(tag)}
              >
                <Text style={styles.hashtagText}>#{tag}</Text>
                <Text style={styles.removeHashtagText}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE7E1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    padding: 0,
  },
  mainImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImageText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  contentBlock: {
    marginBottom: 16,
    position: 'relative',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  subheadingInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeBlockButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBlockText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addBlockContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  addBlockButton: {
    width: 40,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hashtagSection: {
    marginBottom: 24,
  },
  hashtagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  hashtagTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    padding: 12,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE7E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  hashtagText: {
    fontSize: 14,
    color: '#333',
  },
  removeHashtagText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default AdminBlogEdit;
