const express = require('express');
const { requireAuth, requireRoles } = require('@src/middleware/auth');
const { uploadMiddlewareAny, handleImagesUpload } = require('@src/controllers/uploadController');

const router = express.Router();

// POST /api/upload/images (seller/admin)
router.post('/images', requireAuth, requireRoles('seller', 'admin'), uploadMiddlewareAny, handleImagesUpload);

module.exports = router;
