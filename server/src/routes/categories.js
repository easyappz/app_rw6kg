const express = require('express');
const { requireAuth, requireRoles } = require('@src/middleware/auth');
const controller = require('@src/controllers/categoryController');

const router = express.Router();

// GET /api/categories
router.get('/', controller.listCategories);

// POST /api/categories (admin)
router.post('/', requireAuth, requireRoles('admin'), controller.createCategory);

// PUT /api/categories/:id (admin)
router.put('/:id', requireAuth, requireRoles('admin'), controller.updateCategory);

// DELETE /api/categories/:id (admin)
router.delete('/:id', requireAuth, requireRoles('admin'), controller.deleteCategory);

module.exports = router;
