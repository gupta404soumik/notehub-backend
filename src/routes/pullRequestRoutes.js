const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../middleware/auth');
const prController = require('../controllers/pullRequestController');

router.use(authMiddleware);

// Fork
router.post('/fork', prController.forkRepository);

// Pull Requests
router.post('/', prController.createPullRequest);
router.get('/', prController.getPullRequests);
router.get('/:prId', prController.getPullRequestById);
router.patch('/:prId', prController.updatePullRequest);
router.post('/:prId/merge', prController.mergePullRequest);
router.post('/:prId/comments', prController.addComment);

module.exports = router;