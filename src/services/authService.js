import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithCredential
  } from 'firebase/auth';
  import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
  import { GoogleSignin } from '@react-native-google-signin/google-signin';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  
  GoogleSignin.configure({
    webClientId: 'AIzaSyC-PbdtSUGVoGkGXxROxNbKtgIk4pJU0Iw', // Replace with your actual Web Client ID
    offlineAccess: true
  });
  
  // Register with email and password
  export const registerWithEmail = async (email, password) => {
    try {
      const auth = getFirebaseAuth();
      const firestore = getFirebaseFirestore();
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email: email,
          createdAt: new Date(),
          coins: 30,
          isAdmin: false,
          emailVerified: false
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Error registering with email:', error);
      throw error;
    }
  };
  
  // Login with email and password
  export const loginWithEmail = async (email, password) => {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in with email:', error);
      throw error;
    }
  };
  
  // Sign in with Google (Android only)
  export const signInWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const firestore = getFirebaseFirestore();
  
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
  
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
  
      const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
  
      if (!userDoc.exists()) {
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: new Date(),
          coins: 30,
          isAdmin: false,
          emailVerified: true
        });
      }
  
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };
  
  // Logout
  export const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  // Update email verification status
  export const updateEmailVerificationStatus = async (userId) => {
    try {
      const firestore = getFirebaseFirestore();
      await setDoc(doc(firestore, 'users', userId), {
        emailVerified: true
      }, { merge: true });
    } catch (error) {
      console.error('Error updating email verification status:', error);
      throw error;
    }
  };
  
  // Get user coins
  export const getUserCoins = async (userId) => {
    try {
      const firestore = getFirebaseFirestore();
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().coins || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting user coins:', error);
      return 0;
    }
  };
  
  // Check if user is admin
  export const checkIfUserIsAdmin = async (userId) => {
    try {
      const firestore = getFirebaseFirestore();
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().isAdmin === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  };
  