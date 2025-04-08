const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Function to send notification when a new blog is created
exports.onNewBlog = functions.firestore
  .document('blogs/{blogId}')
  .onCreate(async (snapshot, context) => {
    const blogData = snapshot.data();
    const blogId = context.params.blogId;
    
    const message = {
      notification: {
        title: 'New Blog Posted',
        body: `Check out the new blog: ${blogData.title}`
      },
      data: {
        blogId,
        category: blogData.category
      },
      topic: 'new_blogs'
    };
    
    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { error: error.message };
    }
  });

// Function to award coins to users for engagement
exports.awardCoinsForEngagement = functions.firestore
  .document('likes/{likeId}')
  .onCreate(async (snapshot, context) => {
    const likeData = snapshot.data();
    const userId = likeData.userId;
    
    try {
      // Get user document
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;
        
        // Award 1 coin for liking a blog
        await userRef.update({
          coins: currentCoins + 1
        });
        
        console.log(`Awarded 1 coin to user ${userId}`);
        return { success: true };
      }
      
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Error awarding coins:', error);
      return { error: error.message };
    }
  });