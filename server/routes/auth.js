// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/verify
// @desc    Verify token and get user data
// @access  Private
router.get('/verify', auth, verifyToken);

module.exports = router;