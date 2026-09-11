const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const repositoryController = require('../controllers/repositoryController');

// Public routes
router.get('/', repositoryController.getRepositories);
router.get('/:repoId', repositoryController.getRepositoryById);

// Protected routes (require authentication)
router.post('/', authMiddleware, repositoryController.createRepository);
router.patch('/:repoId', authMiddleware, repositoryController.updateRepository);
router.delete('/:repoId', authMiddleware, repositoryController.deleteRepository);
router.post('/:repoId/star', authMiddleware, repositoryController.starRepository);

module.exports = router;