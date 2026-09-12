const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public search routes (no auth required)
router.get('/', searchController.search);
router.get('/trending', searchController.getTrending);
router.get('/new', searchController.getNewRepositories);

module.exports = router;