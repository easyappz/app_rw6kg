const express = require('express');
const authMiddleware = require('@src/middlewares/auth');
const { me } = require('@src/controllers/authController');

const router = express.Router();

// Alias for /api/auth/me
router.get('/me', authMiddleware, me);

module.exports = router;
