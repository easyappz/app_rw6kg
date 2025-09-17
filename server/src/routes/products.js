const express = require('express');
const { requireAuth, requireRoles } = require('@src/middleware/auth');
const controller = require('@src/controllers/productController');

const router = express.Router();

// GET /api/products
router.get('/', controller.listProducts);

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', controller.getProductByIdOrSlug);

// POST /api/products (seller/admin)
router.post('/', requireAuth, requireRoles('seller', 'admin'), controller.createProduct);

// PUT /api/products/:id (owner or admin)
router.put('/:id', requireAuth, controller.updateProduct);

// DELETE /api/products/:id (owner or admin)
router.delete('/:id', requireAuth, controller.deleteProduct);

module.exports = router;
