const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Track active users per document
  const activeUsers = new Map();
  const userCursors = new Map();

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id} (User: ${socket.userId})`);

    // Join a document for editing
    socket.on('document:join', async ({ documentId }) => {
      try {
        const document = await Document.findById(documentId);
        if (!document) {
          socket.emit('error', { message: 'Document not found' });
          return;
        }

        socket.join(`doc:${documentId}`);
        socket.documentId = documentId;

        if (!activeUsers.has(documentId)) {
          activeUsers.set(documentId, new Set());
        }
        activeUsers.get(documentId).add({
          socketId: socket.id,
          userId: socket.userId
        });

        socket.emit('document:sync', {
          content: document.content,
          title: document.title
        });

        socket.to(`doc:${documentId}`).emit('user:joined', {
          socketId: socket.id,
          userId: socket.userId
        });

        const users = Array.from(activeUsers.get(documentId));
        io.to(`doc:${documentId}`).emit('users:list', users);

        console.log(`📝 User ${socket.userId} joined document ${documentId}`);
      } catch (error) {
        console.error('Join document error:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // Leave a document
    socket.on('document:leave', ({ documentId }) => {
      socket.leave(`doc:${documentId}`);
      
      if (activeUsers.has(documentId)) {
        const users = activeUsers.get(documentId);
        for (const user of users) {
          if (user.socketId === socket.id) {
            users.delete(user);
            break;
          }
        }
      }

      io.to(`doc:${documentId}`).emit('user:left', {
        socketId: socket.id,
        userId: socket.userId
      });

      const users = activeUsers.has(documentId) 
        ? Array.from(activeUsers.get(documentId)) 
        : [];
      io.to(`doc:${documentId}`).emit('users:list', users);
    });

    // Real-time edit
    socket.on('document:edit', ({ documentId, content, cursorPosition }) => {
      socket.to(`doc:${documentId}`).emit('document:update', {
        socketId: socket.id,
        userId: socket.userId,
        content,
        cursorPosition,
        timestamp: new Date()
      });
    });

    // Cursor position
    socket.on('cursor:move', ({ documentId, position }) => {
      userCursors.set(socket.id, {
        userId: socket.userId,
        documentId,
        position
      });

      socket.to(`doc:${documentId}`).emit('cursor:update', {
        socketId: socket.id,
        userId: socket.userId,
        position
      });
    });

    // Auto-save
    socket.on('document:save', async ({ documentId, content }) => {
      try {
        const document = await Document.findById(documentId);
        if (document) {
          const oldContent = document.content;
          document.content = content;
          document.commitHistory.push({
            commitId: `auto-${Date.now()}`,
            message: 'Auto-saved by collaboration',
            author: socket.userId,
            changes: {
              additions: Math.max(0, content.length - oldContent.length),
              deletions: Math.max(0, oldContent.length - content.length)
            }
          });
          await document.save();
          socket.emit('document:saved', { 
            success: true, 
            timestamp: new Date() 
          });
        }
      } catch (error) {
        socket.emit('document:save-error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('user:typing', ({ documentId, isTyping }) => {
      socket.to(`doc:${documentId}`).emit('user:typing', {
        socketId: socket.id,
        userId: socket.userId,
        isTyping
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      for (const [documentId, users] of activeUsers.entries()) {
        for (const user of users) {
          if (user.socketId === socket.id) {
            users.delete(user);
            io.to(`doc:${documentId}`).emit('user:left', {
              socketId: socket.id,
              userId: socket.userId
            });
            io.to(`doc:${documentId}`).emit('users:list', Array.from(users));
            break;
          }
        }
        if (users.size === 0) {
          activeUsers.delete(documentId);
        }
      }

      userCursors.delete(socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;