const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['markdown', 'pdf', 'image'],
    default: 'markdown'
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  commitHistory: [{
    commitId: { type: String },
    message: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    changes: {
      additions: { type: Number, default: 0 },
      deletions: { type: Number, default: 0 },
      diff: { type: String }
    }
  }],
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
    addedAt: { type: Date, default: Date.now }
  }],
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);