const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    enum: ['Class 10', 'Class 11', 'Class 12', 'JEE', 'NEET', 'WBJEE'],
    required: true
  },
  subjects: [{
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English']
  }],
  role: {
    type: String,
    enum: ['user', 'contributor', 'teacher'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  stats: {
    repositoriesCreated: { type: Number, default: 0 },
    starsReceived: { type: Number, default: 0 },
    reputationScore: { type: Number, default: 0 }
  },
  refreshTokens: [{
    token: { type: String }
  }]
}, { timestamps: true });

// Password hash before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
