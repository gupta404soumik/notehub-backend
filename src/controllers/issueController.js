const Issue = require('../models/Issue');
const Repository = require('../models/Repository');

// @desc    Create a new issue
// @route   POST /api/repositories/:repoId/issues
exports.createIssue = async (req, res) => {
  try {
    const { title, description, type, severity, documentId } = req.body;
    const { repoId } = req.params;

    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repository not found', statusCode: 404 }
      });
    }

    const issue = new Issue({
      title,
      description,
      type,
      severity: severity || 'medium',
      repositoryId: repoId,
      documentId: documentId || null,
      creator: req.user._id
    });

    await issue.save();
    await issue.populate('creator', 'username firstName lastName profilePicture');

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ISSUE_CREATION_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get all issues for a repository
// @route   GET /api/repositories/:repoId/issues
exports.getIssues = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { status, type } = req.query;
    
    const filter = { repositoryId: repoId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const issues = await Issue.find(filter)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('assignedTo', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: issues, count: issues.length });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get issue by ID
// @route   GET /api/repositories/:repoId/issues/:issueId
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('assignedTo', 'username firstName lastName')
      .populate('resolvedBy', 'username firstName lastName')
      .populate('documentId', 'title');

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Issue not found', statusCode: 404 }
      });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Update issue
// @route   PATCH /api/repositories/:repoId/issues/:issueId
exports.updateIssue = async (req, res) => {
  try {
    const { title, description, type, severity } = req.body;
    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Issue not found', statusCode: 404 }
      });
    }

    if (issue.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only creator can edit', statusCode: 403 }
      });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (type) issue.type = type;
    if (severity) issue.severity = severity;

    await issue.save();
    await issue.populate('creator', 'username firstName lastName profilePicture');

    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Update issue status
// @route   PATCH /api/repositories/:repoId/issues/:issueId/status
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved', "won't-fix"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid status', statusCode: 400 }
      });
    }

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Issue not found', statusCode: 404 }
      });
    }

    // Check if user is repo owner or issue creator
    const repository = await Repository.findById(issue.repositoryId);
    const isRepoOwner = repository.owner.toString() === req.user._id.toString();
    const isCreator = issue.creator.toString() === req.user._id.toString();

    if (!isRepoOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Permission denied', statusCode: 403 }
      });
    }

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
    }

    await issue.save();
    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Delete issue
// @route   DELETE /api/repositories/:repoId/issues/:issueId
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Issue not found', statusCode: 404 }
      });
    }

    const repository = await Repository.findById(issue.repositoryId);
    const isRepoOwner = repository.owner.toString() === req.user._id.toString();
    const isCreator = issue.creator.toString() === req.user._id.toString();

    if (!isRepoOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Permission denied', statusCode: 403 }
      });
    }

    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};