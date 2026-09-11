const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Validation middleware (সহজ সংস্করণ)
const validate = (req, res, next) => {
  const errors = [];
  if (req.body.email && !req.body.email.includes('@')) {
    errors.push('Invalid email');
  }
  if (req.body.password && req.body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (req.body.username && req.body.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (req.body.firstName && req.body.firstName.length === 0) {
    errors.push('First name is required');
  }
  if (req.body.lastName && req.body.lastName.length === 0) {
    errors.push('Last name is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', '),
        statusCode: 400
      }
    });
  }
  next();
};

// Routes
router.post('/register', validate, authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;