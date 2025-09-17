const express = require('express');
const { requireAuth, requireRoles } = require('@src/middleware/auth');
const controller = require('@src/controllers/sellerController');

const router = express.Router();

// GET /api/sellers/:id
router.get('/:id', controller.getSeller);

// GET /api/sellers/:id/products
router.get('/:id/products', controller.getSellerProducts);

// POST /api/sellers/register (seller/admin)
router.post('/register', requireAuth, requireRoles('seller', 'admin'), controller.registerSeller);

module.exports = router;
