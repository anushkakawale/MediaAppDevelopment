const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Add client to the set
  clients.add(ws);

  console.log('Client connected');

  // Handle client messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Broadcast the message to all connected clients
      broadcast(data);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Broadcast message to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.post('/notify/blog-update', express.json(), (req, res) => {
  const { type, data } = req.body;
  broadcast({ type, data });
  res.status(200).json({ message: 'Notification sent' });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});