const PullRequest = require('../models/PullRequest');
const Repository = require('../models/Repository');
const Document = require('../models/Document');

// @desc    Fork a repository
// @route   POST /api/repositories/:repoId/fork
exports.forkRepository = async (req, res) => {
  try {
    const originalRepo = await Repository.findById(req.params.repoId);
    if (!originalRepo) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Repository not found', statusCode: 404 }
      });
    }

    const forkedRepo = new Repository({
      name: `${originalRepo.name} (Fork)`,
      description: originalRepo.description,
      owner: req.user._id,
      category: originalRepo.category,
      subjects: originalRepo.subjects,
      visibility: 'public',
      license: originalRepo.license,
      contributors: [req.user._id],
      metadata: originalRepo.metadata
    });

    await forkedRepo.save();

    // Copy documents
    const originalDocs = await Document.find({ repositoryId: originalRepo._id });
    for (const doc of originalDocs) {
      const newDoc = new Document({
        title: doc.title,
        fileName: doc.fileName,
        content: doc.content,
        repositoryId: forkedRepo._id,
        author: req.user._id,
        type: doc.type,
        commitHistory: [{
          commitId: 'fork-initial',
          message: `Forked from ${originalRepo.name}`,
          author: req.user._id
        }]
      });
      await newDoc.save();
      forkedRepo.documents.push(newDoc._id);
    }

    await forkedRepo.save();

    // Update fork count
    originalRepo.forkCount += 1;
    await originalRepo.save();

    res.status(201).json({ success: true, data: forkedRepo });
  } catch (error) {
    console.error('Fork error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FORK_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Create a pull request
// @route   POST /api/repositories/:repoId/pulls
exports.createPullRequest = async (req, res) => {
  try {
    const { title, description, sourceRepositoryId, filesChanged } = req.body;
    const { repoId } = req.params;

    const targetRepo = await Repository.findById(repoId);
    if (!targetRepo) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Target repository not found', statusCode: 404 }
      });
    }

    const sourceRepo = await Repository.findById(sourceRepositoryId);
    if (!sourceRepo) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Source repository not found', statusCode: 404 }
      });
    }

    const pr = new PullRequest({
      title,
      description,
      repositoryId: repoId,
      sourceRepositoryId,
      creator: req.user._id,
      reviewer: targetRepo.owner,
      filesChanged: filesChanged || []
    });

    await pr.save();
    await pr.populate('creator', 'username firstName lastName profilePicture');

    res.status(201).json({ success: true, data: pr });
  } catch (error) {
    console.error('Create PR error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PR_CREATION_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get all pull requests for a repository
// @route   GET /api/repositories/:repoId/pulls
exports.getPullRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { repositoryId: req.params.repoId };
    if (status) filter.status = status;

    const pulls = await PullRequest.find(filter)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('reviewer', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pulls, count: pulls.length });
  } catch (error) {
    console.error('Get PRs error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Get PR by ID
// @route   GET /api/repositories/:repoId/pulls/:prId
exports.getPullRequestById = async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.prId)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('reviewer', 'username firstName lastName profilePicture')
      .populate('mergedBy', 'username firstName lastName')
      .populate('comments.userId', 'username firstName lastName profilePicture');

    if (!pr) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Pull request not found', statusCode: 404 }
      });
    }

    res.json({ success: true, data: pr });
  } catch (error) {
    console.error('Get PR error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Update PR status (approve/reject)
// @route   PATCH /api/repositories/:repoId/pulls/:prId
exports.updatePullRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const pr = await PullRequest.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'PR not found', statusCode: 404 }
      });
    }

    const repo = await Repository.findById(pr.repositoryId);
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only repo owner can review', statusCode: 403 }
      });
    }

    if (!['open', 'rejected', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid status', statusCode: 400 }
      });
    }

    pr.status = status;
    await pr.save();

    res.json({ success: true, data: pr });
  } catch (error) {
    console.error('Update PR error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Merge a pull request
// @route   POST /api/repositories/:repoId/pulls/:prId/merge
exports.mergePullRequest = async (req, res) => {
  try {
    const pr = await PullRequest.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'PR not found', statusCode: 404 }
      });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only open PRs can be merged', statusCode: 400 }
      });
    }

    const targetRepo = await Repository.findById(pr.repositoryId);
    if (targetRepo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only repo owner can merge', statusCode: 403 }
      });
    }

    // Copy documents from source repo to target repo
    const sourceDocs = await Document.find({ repositoryId: pr.sourceRepositoryId });
    for (const doc of sourceDocs) {
      const existingDoc = await Document.findOne({
        repositoryId: pr.repositoryId,
        title: doc.title
      });

      if (existingDoc) {
        // Update existing document
        existingDoc.content = doc.content;
        existingDoc.commitHistory.push({
          commitId: `merge-${pr._id}`,
          message: `Merged PR: ${pr.title}`,
          author: req.user._id
        });
        await existingDoc.save();
      } else {
        // Add new document
        const newDoc = new Document({
          title: doc.title,
          fileName: doc.fileName,
          content: doc.content,
          repositoryId: pr.repositoryId,
          author: pr.creator,
          type: doc.type,
          commitHistory: [{
            commitId: `merge-${pr._id}`,
            message: `Merged from PR: ${pr.title}`,
            author: req.user._id
          }]
        });
        await newDoc.save();
        targetRepo.documents.push(newDoc._id);
      }
    }

    // Add PR creator as contributor
    if (!targetRepo.contributors.includes(pr.creator)) {
      targetRepo.contributors.push(pr.creator);
    }
    await targetRepo.save();

    // Update PR
    pr.status = 'merged';
    pr.mergedAt = new Date();
    pr.mergedBy = req.user._id;
    await pr.save();

    res.json({ success: true, data: pr, message: 'Pull request merged successfully' });
  } catch (error) {
    console.error('Merge PR error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'MERGE_FAILED', message: error.message, statusCode: 500 }
    });
  }
};

// @desc    Add comment to PR
// @route   POST /api/repositories/:repoId/pulls/:prId/comments
exports.addComment = async (req, res) => {
  try {
    const { text, lineNumber } = req.body;
    const pr = await PullRequest.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'PR not found', statusCode: 404 }
      });
    }

    pr.comments.push({
      userId: req.user._id,
      text,
      lineNumber: lineNumber || null
    });

    await pr.save();
    await pr.populate('comments.userId', 'username firstName lastName profilePicture');

    res.status(201).json({ success: true, data: pr.comments[pr.comments.length - 1] });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'COMMENT_FAILED', message: error.message, statusCode: 500 }
    });
  }
};