const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 5000,
    default: ''
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  sourceRepositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'merged', 'rejected', 'draft'],
    default: 'open'
  },
  filesChanged: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    additions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 },
    diff: { type: String, default: '' }
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    lineNumber: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
  }],
  mergedAt: { type: Date, default: null },
  mergedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

pullRequestSchema.index({ repositoryId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PullRequest', pullRequestSchema);