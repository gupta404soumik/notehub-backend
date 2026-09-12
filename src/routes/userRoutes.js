const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserProfile);
router.get('/:userId/repositories', userController.getUserRepositories);
router.get('/:userId/stats', userController.getUserStats);

// Protected routes
router.patch('/me', authMiddleware, userController.updateProfile);
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;