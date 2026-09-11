require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const connectDB = require('./config/db');
const setupSocket = require('./config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware (Helmet বন্ধ করা হয়েছে টেস্টিং এর জন্য)
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/repositories', require('./routes/RepositoryRoutes'));
app.use('/api/repositories/:repoId/documents', require('./routes/documentRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'NoteHub API is running!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup Socket.io
const io = setupSocket(server);
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});