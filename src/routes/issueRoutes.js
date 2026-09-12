const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../middleware/auth');
const issueController = require('../controllers/issueController');

// All routes require authentication
router.use(authMiddleware);

// Issue CRUD
router.post('/', issueController.createIssue);
router.get('/', issueController.getIssues);
router.get('/:issueId', issueController.getIssueById);
router.patch('/:issueId', issueController.updateIssue);
router.patch('/:issueId/status', issueController.updateIssueStatus);
router.delete('/:issueId', issueController.deleteIssue);

module.exports = router;