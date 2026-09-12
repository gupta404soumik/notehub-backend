const User = require('../models/user');
const Repository = require('../models/Repository');

// @desc    Get user profile by ID
// @route   GET /api/users/:userId
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found', statusCode: 404 }
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Update current user's profile
// @route   PATCH /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'grade', 'subjects', 'profilePicture', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshTokens');

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get repositories by user
// @route   GET /api/users/:userId/repositories
exports.getUserRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({
      owner: req.params.userId,
      isArchived: false
    })
      .populate('owner', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: repositories, count: repositories.length });
  } catch (error) {
    console.error('Get user repos error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get user's contribution stats
// @route   GET /api/users/:userId/stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found', statusCode: 404 }
      });
    }

    const repositoriesCount = await Repository.countDocuments({ owner: req.params.userId });
    const totalStars = await Repository.aggregate([
      { $match: { owner: user._id } },
      { $group: { _id: null, total: { $sum: '$starCount' } } }
    ]);

    res.json({
      success: true,
      data: {
        repositoriesCreated: repositoriesCount,
        starsReceived: totalStars[0]?.total || 0,
        contributionsMerged: user.stats.contributionsMerged || 0,
        reputationScore: user.stats.reputationScore || 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Search query required', statusCode: 400 }
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    })
      .select('username firstName lastName profilePicture grade role stats')
      .limit(20);

    res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SEARCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Delete own account (30-day grace period simulated)
// @route   DELETE /api/users/me
exports.deleteAccount = async (req, res) => {
  try {
    // For now, just mark for deletion (30-day grace could be implemented later)
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 
        'preferences.accountDeletionRequested': new Date(),
        'preferences.darkMode': false
      }
    });

    res.json({
      success: true,
      message: 'Account deletion requested. You have 30 days to cancel.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};