const express = require('express');
const authMiddleware = require('@src/middlewares/auth');
const {
  register,
  login,
  me,
  updateProfile,
  changePassword,
} = require('@src/controllers/authController');

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);

// Protected
router.get('/me', authMiddleware, me);
router.put('/me', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

module.exports = router;
