import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    Timestamp,
    setDoc
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { getFirebaseFirestore, getFirebaseStorage } from './firebase';
  import { sendMessage } from './websocketService';
  
  // Get all blogs
  export const getAllBlogs = async () => {
    try {
      const firestore = getFirebaseFirestore();
      
      const blogsQuery = query(
        collection(firestore, 'blogs'),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(blogsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting blogs:', error);
      throw error;
    }
  };
  
  // Get blogs by category
  export const getBlogsByCategory = async (category) => {
    try {
      const firestore = getFirebaseFirestore();
      
      const blogsQuery = query(
        collection(firestore, 'blogs'),
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(blogsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting blogs by category:', error);
      throw error;
    }
  };
  
  // Get blog by ID
  export const getBlogById = async (blogId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      const docRef = doc(firestore, 'blogs', blogId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting blog by ID:', error);
      throw error;
    }
  };
  
  // Create blog
  export const createBlog = async (blog, imageFile) => {
    try {
      const firestore = getFirebaseFirestore();
      const storage = getFirebaseStorage();
      
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `blog-images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Add blog to Firestore
      const docRef = await addDoc(collection(firestore, 'blogs'), {
        ...blog,
        imageUrl,
        date: Timestamp.now(),
        likes: 0,
        saves: 0
      });
      
      // Notify via WebSocket
      sendMessage('new_blog', {
        id: docRef.id,
        title: blog.title,
        category: blog.category
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  };
  
  // Update blog
  export const updateBlog = async (blogId, blog, imageFile) => {
    try {
      const firestore = getFirebaseFirestore();
      const storage = getFirebaseStorage();
      
      const blogRef = doc(firestore, 'blogs', blogId);
      
      let updateData = { ...blog };
      
      // If there's a new image, upload it
      if (imageFile) {
        const imageRef = ref(storage, `blog-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);
        updateData.imageUrl = imageUrl;
      }
      
      await updateDoc(blogRef, updateData);
      
      // Notify via WebSocket
      sendMessage('update_blog', {
        id: blogId,
        title: blog.title,
        category: blog.category
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  };
  
  // Delete blog
  export const deleteBlog = async (blogId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      await deleteDoc(doc(firestore, 'blogs', blogId));
      
      // Notify via WebSocket
      sendMessage('delete_blog', {
        id: blogId
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  };
  
  // Like blog
  export const likeBlog = async (blogId, userId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      // Check if user already liked this blog
      const likeRef = doc(firestore, 'likes', `${userId}_${blogId}`);
      const likeDoc = await getDoc(likeRef);
      
      const blogRef = doc(firestore, 'blogs', blogId);
      const blogDoc = await getDoc(blogRef);
      
      if (!blogDoc.exists()) {
        throw new Error('Blog not found');
      }
      
      const currentLikes = blogDoc.data().likes || 0;
      
      if (likeDoc.exists()) {
        // User already liked, so unlike
        await deleteDoc(likeRef);
        await updateDoc(blogRef, {
          likes: Math.max(0, currentLikes - 1)
        });
        return false; // Returned unliked status
      } else {
        // User hasn't liked, so add like
        await setDoc(likeRef, {
          userId,
          blogId,
          timestamp: Timestamp.now()
        });
        await updateDoc(blogRef, {
          likes: currentLikes + 1
        });
        return true; // Returned liked status
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      throw error;
    }
  };
  
  // Save blog
  export const saveBlog = async (blogId, userId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      // Check if user already saved this blog
      const saveRef = doc(firestore, 'saves', `${userId}_${blogId}`);
      const saveDoc = await getDoc(saveRef);
      
      const blogRef = doc(firestore, 'blogs', blogId);
      const blogDoc = await getDoc(blogRef);
      
      if (!blogDoc.exists()) {
        throw new Error('Blog not found');
      }
      
      const currentSaves = blogDoc.data().saves || 0;
      
      if (saveDoc.exists()) {
        // User already saved, so unsave
        await deleteDoc(saveRef);
        await updateDoc(blogRef, {
          saves: Math.max(0, currentSaves - 1)
        });
        return false; // Returned unsaved status
      } else {
        // User hasn't saved, so add save
        await setDoc(saveRef, {
          userId,
          blogId,
          timestamp: Timestamp.now()
        });
        await updateDoc(blogRef, {
          saves: currentSaves + 1
        });
        return true; // Returned saved status
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      throw error;
    }
  };
  
  // Check if user liked a blog
  export const checkIfUserLikedBlog = async (blogId, userId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      const likeRef = doc(firestore, 'likes', `${userId}_${blogId}`);
      const likeDoc = await getDoc(likeRef);
      return likeDoc.exists();
    } catch (error) {
      console.error('Error checking if user liked blog:', error);
      return false;
    }
  };
  
  // Check if user saved a blog
  export const checkIfUserSavedBlog = async (blogId, userId) => {
    try {
      const firestore = getFirebaseFirestore();
      
      const saveRef = doc(firestore, 'saves', `${userId}_${blogId}`);
      const saveDoc = await getDoc(saveRef);
      return saveDoc.exists();
    } catch (error) {
      console.error('Error checking if user saved blog:', error);
      return false;
    }
  };
  
  // Subscribe to blogs (real-time updates)
  export const subscribeToBlogs = (callback, category) => {
    const firestore = getFirebaseFirestore();
    
    let blogsQuery;
    
    if (category && category !== 'ForYou') {
      blogsQuery = query(
        collection(firestore, 'blogs'),
        where('category', '==', category),
        orderBy('date', 'desc')
      );
    } else {
      blogsQuery = query(
        collection(firestore, 'blogs'),
        orderBy('date', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(blogsQuery, (querySnapshot) => {
      const blogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(blogs);
    }, (error) => {
      console.error('Error subscribing to blogs:', error);
    });
    
    return unsubscribe;
  };