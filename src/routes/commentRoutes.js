const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// All comment routes require authentication
router.use(authMiddleware);

// Create a new comment
router.post('/', commentController.createComment);

// Get comments for a specific entity
router.get('/:entityType/:entityId', commentController.getComments);

// Update a comment
router.patch('/:commentId', commentController.updateComment);

// Delete a comment
router.delete('/:commentId', commentController.deleteComment);

// Vote on a comment (helpful/not helpful)
router.post('/:commentId/vote', commentController.voteComment);

module.exports = router;