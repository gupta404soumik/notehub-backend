const Comment = require('../models/Comment');
const Repository = require('../models/Repository');
const Document = require('../models/Document');

// @desc    Create a comment
// @route   POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { entityType, entityId, content, parentComment } = req.body;

    // Validate entity type
    if (!['repository', 'document', 'pull_request', 'issue'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ENTITY_TYPE',
          message: 'Invalid entity type',
          statusCode: 400
        }
      });
    }

    // Check if entity exists
    let entity;
    if (entityType === 'repository') {
      entity = await Repository.findById(entityId);
    } else if (entityType === 'document') {
      entity = await Document.findById(entityId);
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `${entityType} not found`,
          statusCode: 404
        }
      });
    }

    // If replying to a comment, check parent exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Parent comment not found',
            statusCode: 404
          }
        });
      }
    }

    const comment = new Comment({
      entityType,
      entityId,
      author: req.user._id,
      content,
      parentComment: parentComment || null
    });

    await comment.save();

    // If reply, add to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Populate author info
    await comment.populate('author', 'username firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_CREATION_FAILED',
        message: error.message || 'Failed to create comment',
        statusCode: 500
      }
    });
  }
};

// @desc    Get comments for an entity
// @route   GET /api/comments/:entityType/:entityId
exports.getComments = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      entityType,
      entityId,
      parentComment: null,
      isDeleted: false
    })
      .populate('author', 'username firstName lastName profilePicture')
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: {
          path: 'author',
          select: 'username firstName lastName profilePicture'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch comments',
        statusCode: 500
      }
    });
  }
};

// @desc    Update a comment
// @route   PATCH /api/comments/:commentId
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Comment not found',
          statusCode: 404
        }
      });
    }

    // Only author can edit
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own comments',
          statusCode: 403
        }
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username firstName lastName profilePicture');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update comment',
        statusCode: 500
      }
    });
  }
};

// @desc    Delete a comment (soft delete)
// @route   DELETE /api/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Comment not found',
          statusCode: 404
        }
      });
    }

    // Only author can delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments',
          statusCode: 403
        }
      });
    }

    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete comment',
        statusCode: 500
      }
    });
  }
};

// @desc    Mark comment as helpful/not helpful
// @route   POST /api/comments/:commentId/vote
exports.voteComment = async (req, res) => {
  try {
    const { vote } = req.body; // 'helpful' or 'not_helpful'

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Comment not found',
          statusCode: 404
        }
      });
    }

    const userId = req.user._id;
    const hasHelpfulVoted = comment.helpfulBy.some(id => id.toString() === userId.toString());
    const hasNotHelpfulVoted = comment.notHelpfulBy.some(id => id.toString() === userId.toString());

    if (vote === 'helpful') {
      if (hasHelpfulVoted) {
        // Remove vote (toggle)
        comment.helpfulBy = comment.helpfulBy.filter(id => id.toString() !== userId.toString());
        comment.helpfulCount = Math.max(0, comment.helpfulCount - 1);
      } else {
        // Add vote
        comment.helpfulBy.push(userId);
        comment.helpfulCount += 1;
        
        // Remove not-helpful vote if exists
        if (hasNotHelpfulVoted) {
          comment.notHelpfulBy = comment.notHelpfulBy.filter(id => id.toString() !== userId.toString());
          comment.notHelpfulCount = Math.max(0, comment.notHelpfulCount - 1);
        }
      }
    } else if (vote === 'not_helpful') {
      if (hasNotHelpfulVoted) {
        comment.notHelpfulBy = comment.notHelpfulBy.filter(id => id.toString() !== userId.toString());
        comment.notHelpfulCount = Math.max(0, comment.notHelpfulCount - 1);
      } else {
        comment.notHelpfulBy.push(userId);
        comment.notHelpfulCount += 1;
        
        if (hasHelpfulVoted) {
          comment.helpfulBy = comment.helpfulBy.filter(id => id.toString() !== userId.toString());
          comment.helpfulCount = Math.max(0, comment.helpfulCount - 1);
        }
      }
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        helpfulCount: comment.helpfulCount,
        notHelpfulCount: comment.notHelpfulCount
      }
    });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VOTE_FAILED',
        message: 'Failed to vote on comment',
        statusCode: 500
      }
    });
  }
};