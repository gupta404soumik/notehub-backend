const Document = require('../models/Document');
const Repository = require('../models/Repository');

// @desc    Create a new document
// @route   POST /api/repositories/:repoId/documents
exports.createDocument = async (req, res) => {
  try {
    const { title, content, type, isDraft } = req.body;
    const { repoId } = req.params;

    // Check if repository exists
    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    // Check if user has access
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isContributor = repository.contributors.some(
      c => c.toString() === req.user._id.toString()
    );

    if (!isOwner && !isContributor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this repository',
          statusCode: 403
        }
      });
    }

    // Create document
    const document = new Document({
      title,
      fileName: title.replace(/\s+/g, '_').toLowerCase() + '.md',
      content: content || '',
      repositoryId: repoId,
      author: req.user._id,
      type: type || 'markdown',
      isDraft: isDraft || false,
      commitHistory: [{
        commitId: 'initial',
        message: 'Initial commit',
        author: req.user._id,
        changes: {
          additions: content ? content.split('\n').length : 0,
          deletions: 0
        }
      }]
    });

    await document.save();

    // Add document to repository
    repository.documents.push(document._id);
    await repository.save();

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_CREATION_FAILED',
        message: error.message || 'Failed to create document',
        statusCode: 500
      }
    });
  }
};

// @desc    Get all documents from a repository
// @route   GET /api/repositories/:repoId/documents
exports.getDocuments = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    const documents = await Document.find({ repositoryId: repoId })
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch documents',
        statusCode: 500
      }
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/repositories/:repoId/documents/:docId
exports.getDocumentById = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findById(docId)
      .populate('author', 'username firstName lastName')
      .populate('commitHistory.author', 'username firstName lastName');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          statusCode: 404
        }
      });
    }

    // Increment views
    document.stats.views += 1;
    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch document',
        statusCode: 500
      }
    });
  }
};

// @desc    Update document
// @route   PUT /api/repositories/:repoId/documents/:docId
exports.updateDocument = async (req, res) => {
  try {
    const { content, title, isDraft } = req.body;
    const { docId } = req.params;

    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          statusCode: 404
        }
      });
    }

    // Check if user has access
    const isAuthor = document.author.toString() === req.user._id.toString();
    const isCollaborator = document.collaborators.some(
      c => c.userId.toString() === req.user._id.toString() && c.role === 'editor'
    );

    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this document',
          statusCode: 403
        }
      });
    }

    // Calculate changes
    const oldContent = document.content;
    const newContent = content || document.content;
    const additions = newContent.length - oldContent.length > 0 ? 
      newContent.split('\n').length - oldContent.split('\n').length : 0;
    const deletions = oldContent.length - newContent.length > 0 ?
      oldContent.split('\n').length - newContent.split('\n').length : 0;

    // Update document
    document.content = newContent;
    if (title) document.title = title;
    if (isDraft !== undefined) document.isDraft = isDraft;

    // Add commit
    document.commitHistory.push({
      commitId: `commit-${Date.now()}`,
      message: req.body.commitMessage || 'Updated document',
      author: req.user._id,
      changes: {
        additions: additions > 0 ? additions : 0,
        deletions: deletions > 0 ? deletions : 0,
        diff: `Updated ${Math.abs(additions - deletions)} lines`
      }
    });

    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update document',
        statusCode: 500
      }
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/repositories/:repoId/documents/:docId
exports.deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
          statusCode: 404
        }
      });
    }

    // Check if user is author or owner
    const isAuthor = document.author.toString() === req.user._id.toString();
    const repository = await Repository.findById(document.repositoryId);
    const isRepoOwner = repository && repository.owner.toString() === req.user._id.toString();

    if (!isAuthor && !isRepoOwner) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this document',
          statusCode: 403
        }
      });
    }

    // Remove document from repository
    await Repository.findByIdAndUpdate(document.repositoryId, {
      $pull: { documents: docId }
    });

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete document',
        statusCode: 500
      }
    });
  }
};