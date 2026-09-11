const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// All routes require authentication
router.use(authMiddleware);

// Document CRUD
router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/:docId', documentController.getDocumentById);
router.put('/:docId', documentController.updateDocument);
router.delete('/:docId', documentController.deleteDocument);

module.exports = router;