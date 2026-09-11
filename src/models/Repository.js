const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['JEE', 'WBJEE', 'NEET', 'Class 10', 'Class 12', 'General'],
    required: true
  },
  subjects: [{
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Other']
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  license: {
    type: String,
    enum: ['MIT', 'CC-BY-SA', 'GPL'],
    default: 'MIT'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  starCount: {
    type: Number,
    default: 0
  },
  forkCount: {
    type: Number,
    default: 0
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    readme: { type: String, default: '' },
    tags: [String],
    guidelines: { type: String, default: '' }
  }
}, { timestamps: true });

repositorySchema.index({ name: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);