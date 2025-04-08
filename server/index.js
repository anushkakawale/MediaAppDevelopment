const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Change to your app's IP in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room for real-time updates
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  // Leave room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });
  
  // Handle new blog event
  socket.on('new_blog', (data) => {
    console.log('New blog created:', data);
    io.emit('new_blog', data);
    
    // Send push notification
    sendPushNotification('new_blogs', 'New Blog Posted', `Check out the new blog: ${data.title}`);
  });
  
  // Handle update blog event
  socket.on('update_blog', (data) => {
    console.log('Blog updated:', data);
    io.emit('update_blog', data);
  });
  
  // Handle delete blog event
  socket.on('delete_blog', (data) => {
    console.log('Blog deleted:', data);
    io.emit('delete_blog', data);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API endpoint to send push notification
app.post('/api/send-notification', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;
    
    await sendPushNotification(topic, title, body, data);
    
    res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Function to send push notification
async function sendPushNotification(topic, title, body, data = {}) {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      topic
    };
    
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`WebSocket server running at http://localhost:${PORT}`);
  console.log('Socket.IO configuration:', io.opts);
}).on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
  }
});
